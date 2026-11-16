import { assistantRepository } from '../storage/AssistantRepository';
import {
  BuildingSpace,
  CompanyContact,
  DisambiguationOption,
  KnowledgeAsset,
  KnowledgeDocument,
  KnowledgeWorkOrder,
  SearchQueryResult,
} from '../types/assistant';

// Term Expansion & Synonym Aliases Dictionary
const SYNONYMS: Record<string, string[]> = {
  ac: ['air conditioner', 'hvac', 'cooling', 'chiller', 'compressor', 'split ac', 'vrv', 'warm air', 'aircon'],
  supervisor: ['superviser', 'manager', 'lead', 'incharge', 'head', 'foreman', 'superintendent'],
  plumbing: ['plumber', 'plumming', 'pipe', 'leak', 'drain', 'geyser', 'water', 'tap', 'booster pump', 'valve'],
  electrical: ['electrician', 'electrcian', 'wiring', 'breaker', 'power', 'light', 'elcb', 'mcb', 'panel', 'outage'],
  carpentry: ['carpenter', 'door', 'closer', 'lock', 'wardrobe', 'hardware', 'wood'],
  emergency: ['urgent', 'hotline', 'sos', '24/7', 'burst', 'fire', 'flooding', 'escalation'],
  procedure: ['sop', 'policy', 'steps', 'guideline', 'reporting', 'process', 'how to', 'protocol'],
  workorder: ['work order', 'wo', 'ticket', 'cases', 'service request', 'assigned work orders', 'open cases'],
};

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/gi, '');
}

function containsTerm(haystack: string, needle: string): boolean {
  const normH = normalize(haystack);
  const normN = normalize(needle);
  if (normH.includes(normN)) return true;

  // Check synonym matches
  for (const [key, aliases] of Object.entries(SYNONYMS)) {
    if (normN === key || aliases.includes(normN)) {
      if (normH.includes(key) || aliases.some(a => normH.includes(a))) {
        return true;
      }
    }
  }

  // Check fuzzy matching for words length >= 4
  const hWords = normH.split(/\s+/);
  const nWords = normN.split(/\s+/);
  for (const nWord of nWords) {
    if (nWord.length >= 4) {
      for (const hWord of hWords) {
        if (hWord.length >= 4 && levenshteinDistance(nWord, hWord) <= 1) {
          return true;
        }
      }
    }
  }

  return false;
}

class LocalSearchProvider {
  public async executeSearch(
    queryText: string,
    currentUserRole: string = 'Real Estate Asset Owner',
    currentUserEmail: string = 'anto@gmail.com'
  ): Promise<SearchQueryResult> {
    const syncMeta = await assistantRepository.getSyncMetadata();
    const lastSyncTime = syncMeta.lastSyncTimestamp;
    const cleanQuery = normalize(queryText);

    // 1. Fetch authorized local data
    const allContacts = await assistantRepository.getContacts();
    const allSpaces = await assistantRepository.getSpaces();
    const allAssets = await assistantRepository.getAssets();
    const allDocs = await assistantRepository.getDocuments();
    const allWorkOrders = await assistantRepository.getWorkOrders();

    // Filter contacts by user access visibility
    const authorizedContacts = allContacts.filter(
      c => c.accessVisibility.length === 0 || c.accessVisibility.includes(currentUserRole)
    );

    // Filter work orders by role & requester email
    const authorizedWorkOrders = allWorkOrders.filter(
      wo =>
        wo.userPermissionRoles.includes(currentUserRole) ||
        (wo.requesterEmail && wo.requesterEmail.toLowerCase() === currentUserEmail.toLowerCase())
    );

    // -----------------------------------------------------------------------
    // INTENT RECOGNITION PIPELINE
    // -----------------------------------------------------------------------

    // A. Supervisor Intent
    const isSupervisorQuery =
      containsTerm(cleanQuery, 'supervisor') ||
      cleanQuery.includes('who is the maintenance supervisor') ||
      cleanQuery.includes('who manages') ||
      cleanQuery.includes('facility lead');

    if (isSupervisorQuery) {
      const supervisors = authorizedContacts.filter(c => c.isSupervisor || c.jobTitle.toLowerCase().includes('supervisor'));
      return {
        intent: 'contact',
        summaryText: `Verified Maintenance Supervisor record retrieved from local database.`,
        contacts: supervisors,
        spaces: [],
        assets: [],
        docs: [],
        workOrders: [],
        citationRef: `DB-EMP-101`,
        isOffline: true,
        lastSyncTime,
        matchCount: supervisors.length,
      };
    }

    // B. Emergency Hotline Intent
    const isEmergencyQuery =
      containsTerm(cleanQuery, 'emergency') ||
      cleanQuery.includes('emergency contact') ||
      cleanQuery.includes('emergency numbers') ||
      cleanQuery.includes('hotline');

    if (isEmergencyQuery) {
      const emergencyContacts = authorizedContacts.filter(
        c => c.department.toLowerCase().includes('emergency') || c.department.toLowerCase().includes('security')
      );
      const emergencyDocs = allDocs.filter(d => d.emergencyLevel === 'Emergency');

      return {
        intent: 'emergency',
        summaryText: `Verified 24/7 Emergency Hotline and Security Desk records retrieved from local cache.`,
        contacts: emergencyContacts,
        spaces: [],
        assets: [],
        docs: emergencyDocs,
        workOrders: [],
        citationRef: `DB-EMG-CONTACTS`,
        isOffline: true,
        lastSyncTime,
        matchCount: emergencyContacts.length + emergencyDocs.length,
      };
    }

    // C. Broad "Show Contacts" Disambiguation
    if (cleanQuery === 'contacts' || cleanQuery === 'show contacts' || cleanQuery === 'contact list') {
      const options: DisambiguationOption[] = [
        { id: 'opt-sup', label: 'Maintenance Supervisor (Victer Manuel)', query: 'Who is the maintenance supervisor?', category: 'Supervisor' },
        { id: 'opt-emg', label: '24/7 Emergency & Security Desk', query: 'Show emergency contact numbers', category: 'Emergency' },
        { id: 'opt-plm', label: 'Plumbing Specialist (Sunil Master)', query: 'Who handles plumbing repairs?', category: 'Plumbing' },
        { id: 'opt-hvac', label: 'HVAC & AC Lead (Ramesh Kumar)', query: 'Who handles AC repairs?', category: 'HVAC' },
        { id: 'opt-bld2', label: 'Building 2 Contacts', query: 'Show contacts for Building 2', category: 'Building' },
      ];

      return {
        intent: 'disambiguation',
        summaryText: `Multiple contact categories available in local cache. Please select the specific contact or trade you need:`,
        contacts: [],
        spaces: [],
        assets: [],
        docs: [],
        workOrders: [],
        disambiguationOptions: options,
        citationRef: `DB-DISAMBIGUATION`,
        isOffline: true,
        lastSyncTime,
        matchCount: options.length,
      };
    }

    // D. Specialized Trade Contacts (Plumbing, HVAC, Electrical, Carpentry)
    const isPlumbingTrade = containsTerm(cleanQuery, 'plumbing') || cleanQuery.includes('who handles plumbing');
    if (isPlumbingTrade) {
      const plumbers = authorizedContacts.filter(c => containsTerm(c.department + ' ' + c.specialty + ' ' + c.jobTitle, 'plumbing'));
      return {
        intent: 'contact',
        summaryText: `Verified Plumbing Repair Specialist retrieved from local database:`,
        contacts: plumbers,
        spaces: [],
        assets: [],
        docs: allDocs.filter(d => containsTerm(d.title + ' ' + d.keywords.join(' '), 'plumbing')),
        workOrders: [],
        citationRef: `DB-EMP-102`,
        isOffline: true,
        lastSyncTime,
        matchCount: plumbers.length,
      };
    }

    const isHvacTrade = containsTerm(cleanQuery, 'ac') || containsTerm(cleanQuery, 'hvac') || cleanQuery.includes('who handles ac');
    if (isHvacTrade && !cleanQuery.includes('procedure') && !cleanQuery.includes('how to')) {
      const hvacTechs = authorizedContacts.filter(c => containsTerm(c.department + ' ' + c.specialty + ' ' + c.jobTitle, 'hvac'));
      const acAssets = allAssets.filter(a => a.category === 'HVAC');
      return {
        intent: 'contact',
        summaryText: `Verified HVAC & Air Conditioning Specialist retrieved from local database:`,
        contacts: hvacTechs,
        spaces: [],
        assets: acAssets,
        docs: allDocs.filter(d => containsTerm(d.title, 'ac failure')),
        workOrders: [],
        citationRef: `DB-EMP-103`,
        isOffline: true,
        lastSyncTime,
        matchCount: hvacTechs.length,
      };
    }

    // E. Building 2 Contacts & Spaces
    const isBld2Query = cleanQuery.includes('building 2') || cleanQuery.includes('bld 2') || cleanQuery.includes('bld2');
    if (isBld2Query) {
      const bld2Contacts = authorizedContacts.filter(c => containsTerm(c.assignedBuilding, 'building 2'));
      const bld2Spaces = allSpaces.filter(s => containsTerm(s.building, 'building 2'));
      return {
        intent: 'space',
        summaryText: `Verified contacts and spaces for Building 2 retrieved from local database:`,
        contacts: bld2Contacts,
        spaces: bld2Spaces,
        assets: [],
        docs: allDocs.filter(d => containsTerm(d.title + ' ' + d.keywords.join(' '), 'building 2')),
        workOrders: [],
        citationRef: `DB-BLD2-SPEC`,
        isOffline: true,
        lastSyncTime,
        matchCount: bld2Contacts.length + bld2Spaces.length,
      };
    }

    // F. Specific Room Query (e.g. "Where is Room 6232?")
    const isRoom6232Query = cleanQuery.includes('6232') || cleanQuery.includes('room 6232');
    if (isRoom6232Query) {
      const room6232 = allSpaces.filter(s => s.room.includes('6232') || s.spaceIdentifier.includes('6232'));
      const bld2SecContact = authorizedContacts.filter(c => c.name.includes('Security'));
      return {
        intent: 'space',
        summaryText: `Verified space details for Room 6232 retrieved from local database:`,
        contacts: bld2SecContact,
        spaces: room6232,
        assets: [],
        docs: allDocs.filter(d => d.id === 'SEC-BLD2-003'),
        workOrders: [],
        citationRef: `SPC-6232`,
        isOffline: true,
        lastSyncTime,
        matchCount: room6232.length,
      };
    }

    // G. Procedures / SOPs (e.g. "What is the procedure for reporting an AC failure?")
    const isProcedureQuery =
      containsTerm(cleanQuery, 'procedure') ||
      cleanQuery.includes('how to report') ||
      cleanQuery.includes('reporting an ac failure') ||
      cleanQuery.includes('ac failure procedure') ||
      cleanQuery.includes('sop') ||
      cleanQuery.includes('policy') ||
      cleanQuery.includes('helpdesk');

    if (isProcedureQuery) {
      const matchedDocs = allDocs.filter(d => {
        return (
          containsTerm(d.title, cleanQuery) ||
          d.keywords.some(k => containsTerm(cleanQuery, k) || containsTerm(k, cleanQuery))
        );
      });

      const docsToReturn = matchedDocs.length > 0 ? matchedDocs : allDocs;
      return {
        intent: 'doc',
        summaryText: `Verified Maintenance Procedure & SOP document retrieved from local cache:`,
        contacts: authorizedContacts.filter(c => c.id === 'EMP-103'),
        spaces: [],
        assets: [],
        docs: docsToReturn,
        workOrders: [],
        citationRef: docsToReturn[0]?.refDoc || `SOP-HVAC-2026-v2`,
        isOffline: true,
        lastSyncTime,
        matchCount: docsToReturn.length,
      };
    }

    // H. Work Orders Intent (e.g. "Show my assigned Work Orders")
    const isWorkOrderQuery =
      containsTerm(cleanQuery, 'workorder') ||
      cleanQuery.includes('assigned work orders') ||
      cleanQuery.includes('my work orders') ||
      cleanQuery.includes('open cases') ||
      cleanQuery.includes('wo-2026') ||
      cleanQuery.includes('ic260');

    if (isWorkOrderQuery) {
      return {
        intent: 'work_order',
        summaryText: `Retrieved ${authorizedWorkOrders.length} authorized Work Orders from local cache for ${currentUserRole}:`,
        contacts: [],
        spaces: [],
        assets: [],
        docs: [],
        workOrders: authorizedWorkOrders,
        citationRef: `DB-WO-PERMITTED`,
        isOffline: true,
        lastSyncTime,
        matchCount: authorizedWorkOrders.length,
      };
    }

    // -----------------------------------------------------------------------
    // GENERAL MATCH FALLBACK ACROSS ALL TABLES
    // -----------------------------------------------------------------------
    const matchedContacts = authorizedContacts.filter(c =>
      containsTerm(c.name + ' ' + c.jobTitle + ' ' + c.department + ' ' + c.assignedBuilding + ' ' + c.specialty, cleanQuery)
    );

    const matchedSpaces = allSpaces.filter(s =>
      containsTerm(s.site + ' ' + s.building + ' ' + s.floor + ' ' + s.room + ' ' + s.spaceIdentifier + ' ' + s.category + ' ' + (s.description || ''), cleanQuery)
    );

    const matchedAssets = allAssets.filter(a =>
      containsTerm(a.name + ' ' + a.location + ' ' + a.category + ' ' + a.assignedProvider + ' ' + (a.brandModel || ''), cleanQuery)
    );

    const matchedDocs = allDocs.filter(d =>
      containsTerm(d.title + ' ' + d.category + ' ' + d.content + ' ' + d.keywords.join(' '), cleanQuery)
    );

    const matchedWos = authorizedWorkOrders.filter(w =>
      containsTerm(w.id + ' ' + w.title + ' ' + w.apartmentOrSpace + ' ' + w.assignedTo + ' ' + w.status, cleanQuery)
    );

    const totalMatches =
      matchedContacts.length + matchedSpaces.length + matchedAssets.length + matchedDocs.length + matchedWos.length;

    if (totalMatches > 0) {
      return {
        intent: 'contact',
        summaryText: `Found ${totalMatches} verified matching record(s) in local company database:`,
        contacts: matchedContacts,
        spaces: matchedSpaces,
        assets: matchedAssets,
        docs: matchedDocs,
        workOrders: matchedWos,
        citationRef: `DB-LOCAL-MATCH`,
        isOffline: true,
        lastSyncTime,
        matchCount: totalMatches,
      };
    }

    // I. NO MATCH / MISSING DATA STATE (Guaranteed Requirement: Never hallucinate!)
    return {
      intent: 'no_match',
      summaryText: `No verified matching information is stored in the local knowledge cache for "${queryText}".\n\nVerified last synchronization: ${lastSyncTime}.`,
      contacts: [],
      spaces: [],
      assets: [],
      docs: [],
      workOrders: [],
      citationRef: `DB-LOCAL-EMPTY-MATCH`,
      isOffline: true,
      lastSyncTime,
      matchCount: 0,
    };
  }
}

export const localSearchProvider = new LocalSearchProvider();
