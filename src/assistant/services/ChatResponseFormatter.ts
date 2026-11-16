import { ChatMessage, SearchQueryResult } from '../types/assistant';

class ChatResponseFormatter {
  public formatSearchResultToMessage(
    userText: string,
    queryResult: SearchQueryResult
  ): ChatMessage {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let text = queryResult.summaryText;
    let suggestedFollowUps: string[] = [];

    switch (queryResult.intent) {
      case 'contact':
        if (queryResult.contacts.length > 0) {
          const supervisor = queryResult.contacts[0];
          text = `Here is the verified contact information stored in the local database for **${supervisor.name}** (${supervisor.jobTitle}):`;
          suggestedFollowUps = [
            'Show emergency contact numbers.',
            'Who handles plumbing repairs?',
            'Show my assigned Work Orders.',
          ];
        }
        break;

      case 'emergency':
        text = `🚨 **24/7 Emergency Escalation Contacts & Hotline**\nFor active water leaks, electrical hazards, or safety emergencies:`;
        suggestedFollowUps = [
          'What is the procedure for reporting an AC failure?',
          'Who is the maintenance supervisor?',
          'Where is Room 6232?',
        ];
        break;

      case 'space':
        if (queryResult.spaces.length > 0) {
          const sp = queryResult.spaces[0];
          text = `📍 **Location Details: ${sp.room} (${sp.building})**\nSite: ${sp.site}\nFloor: ${sp.floor}\nSpace Identifier: ${sp.spaceIdentifier}\n\n${sp.description}`;
          suggestedFollowUps = [
            'Show contacts for Building 2.',
            'Who handles electrical repairs?',
            'Show my assigned Work Orders.',
          ];
        }
        break;

      case 'doc':
        if (queryResult.docs.length > 0) {
          const doc = queryResult.docs[0];
          text = `📋 **${doc.title}**\n[Ref: ${doc.refDoc}]\n\n${doc.content}`;
          suggestedFollowUps = [
            'Who is the maintenance supervisor?',
            'Show emergency contact numbers.',
            'Show my assigned Work Orders.',
          ];
        }
        break;

      case 'work_order':
        text = `🔧 **Permitted Work Orders Cache** (${queryResult.workOrders.length} records found):`;
        suggestedFollowUps = [
          'What is the procedure for reporting an AC failure?',
          'Who is the maintenance supervisor?',
          'Where is Room 6232?',
        ];
        break;

      case 'disambiguation':
        text = queryResult.summaryText;
        suggestedFollowUps = (queryResult.disambiguationOptions || []).map(o => o.query);
        break;

      case 'no_match':
        text = `No verified matching information is stored in the local knowledge cache for "${userText}".\n\nVerified last synchronization: ${queryResult.lastSyncTime}.\n\n*Note: Noverra Assistant strictly answers from verified local company records and never invents data.*`;
        suggestedFollowUps = [
          'Who is the maintenance supervisor?',
          'Show emergency contact numbers.',
          'What is the procedure for reporting an AC failure?',
        ];
        break;
    }

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender: 'assistant',
      text,
      timestamp,
      isOffline: true,
      lastSyncTime: queryResult.lastSyncTime,
      queryResult,
      citationRef: queryResult.citationRef,
      suggestedFollowUps,
    };
  }
}

export const chatResponseFormatter = new ChatResponseFormatter();
