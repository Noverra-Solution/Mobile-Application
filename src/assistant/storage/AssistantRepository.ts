import * as SQLite from 'expo-sqlite';
import {
  DEMO_ASSETS,
  DEMO_CONTACTS,
  DEMO_DOCUMENTS,
  DEMO_SPACES,
  DEMO_WORK_ORDERS,
  INITIAL_SYNC_METADATA,
} from '../data/fictionalDemoData';
import {
  BuildingSpace,
  ChatMessage,
  CompanyContact,
  KnowledgeAsset,
  KnowledgeDocument,
  KnowledgeWorkOrder,
  SyncMetadata,
} from '../types/assistant';

const DB_NAME = 'noverra_assistant.db';

// In-Memory Fallback Store (Used if SQLite Native Module is not available or in web sandbox)
let memContacts: CompanyContact[] = [...DEMO_CONTACTS];
let memSpaces: BuildingSpace[] = [...DEMO_SPACES];
let memAssets: KnowledgeAsset[] = [...DEMO_ASSETS];
let memDocs: KnowledgeDocument[] = [...DEMO_DOCUMENTS];
let memWorkOrders: KnowledgeWorkOrder[] = [...DEMO_WORK_ORDERS];
let memChatHistory: Record<string, ChatMessage[]> = {};
let memSyncMetadata: SyncMetadata = { ...INITIAL_SYNC_METADATA };

class AssistantRepository {
  private db: SQLite.SQLiteDatabase | null = null;
  private isUsingSqlite: boolean = false;
  private initialized: boolean = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      if (typeof SQLite.openDatabaseSync === 'function') {
        this.db = SQLite.openDatabaseSync(DB_NAME);
        this.isUsingSqlite = true;
        await this.setupSqliteTables();
      } else {
        console.log('[AssistantRepository] SQLite.openDatabaseSync unavailable. Using structured memory repository.');
        this.isUsingSqlite = false;
      }
    } catch (e) {
      console.warn('[AssistantRepository] SQLite init warning, falling back to memory repository:', e);
      this.isUsingSqlite = false;
    } finally {
      this.initialized = true;
    }
  }

  private async setupSqliteTables(): Promise<void> {
    if (!this.db) return;

    try {
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS sync_meta (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lastSyncTimestamp TEXT,
          recordCount INTEGER,
          schemaVersion INTEGER,
          organizationId TEXT,
          syncStatus TEXT
        );

        CREATE TABLE IF NOT EXISTS contacts (
          id TEXT PRIMARY KEY,
          name TEXT,
          jobTitle TEXT,
          department TEXT,
          phone TEXT,
          email TEXT,
          assignedBuilding TEXT,
          availability TEXT,
          accessVisibility TEXT,
          isSupervisor INTEGER,
          specialty TEXT,
          avatarColor TEXT
        );

        CREATE TABLE IF NOT EXISTS spaces (
          id TEXT PRIMARY KEY,
          site TEXT,
          building TEXT,
          floor TEXT,
          room TEXT,
          spaceIdentifier TEXT,
          category TEXT,
          contactPerson TEXT,
          description TEXT
        );

        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY,
          name TEXT,
          location TEXT,
          category TEXT,
          assignedProvider TEXT,
          healthScore INTEGER,
          warrantyStatus TEXT,
          lastServiceDate TEXT,
          brandModel TEXT
        );

        CREATE TABLE IF NOT EXISTS docs (
          id TEXT PRIMARY KEY,
          category TEXT,
          title TEXT,
          keywords TEXT,
          content TEXT,
          steps TEXT,
          emergencyLevel TEXT,
          refDoc TEXT
        );

        CREATE TABLE IF NOT EXISTS work_orders (
          id TEXT PRIMARY KEY,
          title TEXT,
          type TEXT,
          status TEXT,
          priority TEXT,
          assignedTo TEXT,
          dueDate TEXT,
          apartmentOrSpace TEXT,
          userPermissionRoles TEXT,
          requesterEmail TEXT,
          cost REAL
        );

        CREATE TABLE IF NOT EXISTS chat_history (
          id TEXT PRIMARY KEY,
          sessionUserId TEXT,
          sender TEXT,
          text TEXT,
          timestamp TEXT,
          isOffline INTEGER,
          lastSyncTime TEXT,
          queryResultJson TEXT,
          citationRef TEXT
        );
      `);

      // Populate initial data if table is empty
      const countResult = this.db.getFirstSync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM contacts;');
      if (!countResult || countResult.cnt === 0) {
        this.seedInitialSqliteData();
      }
    } catch (err) {
      console.warn('[AssistantRepository] Table creation failed:', err);
      this.isUsingSqlite = false;
    }
  }

  private seedInitialSqliteData(): void {
    if (!this.db) return;

    try {
      // Sync meta
      this.db.runSync(
        `INSERT INTO sync_meta (lastSyncTimestamp, recordCount, schemaVersion, organizationId, syncStatus) VALUES (?, ?, ?, ?, ?);`,
        [
          INITIAL_SYNC_METADATA.lastSyncTimestamp,
          INITIAL_SYNC_METADATA.recordCount,
          INITIAL_SYNC_METADATA.schemaVersion,
          INITIAL_SYNC_METADATA.organizationId,
          INITIAL_SYNC_METADATA.syncStatus,
        ]
      );

      // Contacts
      DEMO_CONTACTS.forEach(c => {
        this.db?.runSync(
          `INSERT OR REPLACE INTO contacts (id, name, jobTitle, department, phone, email, assignedBuilding, availability, accessVisibility, isSupervisor, specialty, avatarColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            c.id,
            c.name,
            c.jobTitle,
            c.department,
            c.phone,
            c.email,
            c.assignedBuilding,
            c.availability,
            JSON.stringify(c.accessVisibility),
            c.isSupervisor ? 1 : 0,
            c.specialty || '',
            c.avatarColor || '#D8E9F7',
          ]
        );
      });

      // Spaces
      DEMO_SPACES.forEach(s => {
        this.db?.runSync(
          `INSERT OR REPLACE INTO spaces (id, site, building, floor, room, spaceIdentifier, category, contactPerson, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [s.id, s.site, s.building, s.floor, s.room, s.spaceIdentifier, s.category, s.contactPerson || '', s.description || '']
        );
      });

      // Assets
      DEMO_ASSETS.forEach(a => {
        this.db?.runSync(
          `INSERT OR REPLACE INTO assets (id, name, location, category, assignedProvider, healthScore, warrantyStatus, lastServiceDate, brandModel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [a.id, a.name, a.location, a.category, a.assignedProvider, a.healthScore, a.warrantyStatus, a.lastServiceDate, a.brandModel || '']
        );
      });

      // Docs
      DEMO_DOCUMENTS.forEach(d => {
        this.db?.runSync(
          `INSERT OR REPLACE INTO docs (id, category, title, keywords, content, steps, emergencyLevel, refDoc) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            d.id,
            d.category,
            d.title,
            JSON.stringify(d.keywords),
            d.content,
            JSON.stringify(d.steps || []),
            d.emergencyLevel || 'Standard',
            d.refDoc,
          ]
        );
      });

      // Work Orders
      DEMO_WORK_ORDERS.forEach(w => {
        this.db?.runSync(
          `INSERT OR REPLACE INTO work_orders (id, title, type, status, priority, assignedTo, dueDate, apartmentOrSpace, userPermissionRoles, requesterEmail, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            w.id,
            w.title,
            w.type,
            w.status,
            w.priority,
            w.assignedTo,
            w.dueDate,
            w.apartmentOrSpace,
            JSON.stringify(w.userPermissionRoles),
            w.requesterEmail || '',
            w.cost || 0,
          ]
        );
      });
    } catch (e) {
      console.warn('[AssistantRepository] Seeding SQLite failed:', e);
    }
  }

  // =========================================================================
  // PUBLIC QUERY METHODS
  // =========================================================================

  public async getContacts(): Promise<CompanyContact[]> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        const rows = this.db.getAllSync<any>('SELECT * FROM contacts');
        return rows.map(r => ({
          ...r,
          accessVisibility: JSON.parse(r.accessVisibility || '[]'),
          isSupervisor: Boolean(r.isSupervisor),
        }));
      } catch (e) {
        console.warn('SQLite query failed, fallback to memory:', e);
      }
    }
    return memContacts;
  }

  public async getSpaces(): Promise<BuildingSpace[]> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        return this.db.getAllSync<BuildingSpace>('SELECT * FROM spaces');
      } catch (e) {
        console.warn('SQLite query failed, fallback to memory:', e);
      }
    }
    return memSpaces;
  }

  public async getAssets(): Promise<KnowledgeAsset[]> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        return this.db.getAllSync<KnowledgeAsset>('SELECT * FROM assets');
      } catch (e) {
        console.warn('SQLite query failed, fallback to memory:', e);
      }
    }
    return memAssets;
  }

  public async getDocuments(): Promise<KnowledgeDocument[]> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        const rows = this.db.getAllSync<any>('SELECT * FROM docs');
        return rows.map(r => ({
          ...r,
          keywords: JSON.parse(r.keywords || '[]'),
          steps: JSON.parse(r.steps || '[]'),
        }));
      } catch (e) {
        console.warn('SQLite query failed, fallback to memory:', e);
      }
    }
    return memDocs;
  }

  public async getWorkOrders(): Promise<KnowledgeWorkOrder[]> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        const rows = this.db.getAllSync<any>('SELECT * FROM work_orders');
        return rows.map(r => ({
          ...r,
          userPermissionRoles: JSON.parse(r.userPermissionRoles || '[]'),
        }));
      } catch (e) {
        console.warn('SQLite query failed, fallback to memory:', e);
      }
    }
    return memWorkOrders;
  }

  public async getSyncMetadata(): Promise<SyncMetadata> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        const row = this.db.getFirstSync<SyncMetadata>('SELECT * FROM sync_meta ORDER BY id DESC LIMIT 1;');
        if (row) return row;
      } catch (e) {
        console.warn('SQLite query failed, fallback to memory:', e);
      }
    }
    return memSyncMetadata;
  }

  // =========================================================================
  // CHAT HISTORY & SECURITY PURGE METHODS
  // =========================================================================

  public async getChatHistory(sessionUserId: string): Promise<ChatMessage[]> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        const rows = this.db.getAllSync<any>(
          'SELECT * FROM chat_history WHERE sessionUserId = ? ORDER BY id ASC;',
          [sessionUserId]
        );
        return rows.map(r => ({
          id: r.id,
          sender: r.sender,
          text: r.text,
          timestamp: r.timestamp,
          isOffline: Boolean(r.isOffline),
          lastSyncTime: r.lastSyncTime,
          queryResult: r.queryResultJson ? JSON.parse(r.queryResultJson) : undefined,
          citationRef: r.citationRef,
        }));
      } catch (e) {
        console.warn('SQLite history query failed, fallback:', e);
      }
    }
    return memChatHistory[sessionUserId] || [];
  }

  public async saveChatMessage(sessionUserId: string, message: ChatMessage): Promise<void> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        this.db.runSync(
          `INSERT OR REPLACE INTO chat_history (id, sessionUserId, sender, text, timestamp, isOffline, lastSyncTime, queryResultJson, citationRef) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            message.id,
            sessionUserId,
            message.sender,
            message.text,
            message.timestamp,
            message.isOffline ? 1 : 0,
            message.lastSyncTime || '',
            message.queryResult ? JSON.stringify(message.queryResult) : '',
            message.citationRef || '',
          ]
        );
      } catch (e) {
        console.warn('SQLite saveChatMessage failed:', e);
      }
    }

    if (!memChatHistory[sessionUserId]) {
      memChatHistory[sessionUserId] = [];
    }
    // Prevent duplicate entries
    const exists = memChatHistory[sessionUserId].some(m => m.id === message.id);
    if (!exists) {
      memChatHistory[sessionUserId].push(message);
    }
  }

  public async clearChatHistory(sessionUserId: string): Promise<void> {
    await this.init();
    if (this.isUsingSqlite && this.db) {
      try {
        this.db.runSync('DELETE FROM chat_history WHERE sessionUserId = ?;', [sessionUserId]);
      } catch (e) {
        console.warn('SQLite clearChatHistory failed:', e);
      }
    }
    memChatHistory[sessionUserId] = [];
  }

  /**
   * SECURITY COMPLIANCE:
   * Clears user-specific cached history and sensitive session data on account logout or switch.
   */
  public async clearUserDataOnLogout(sessionUserId: string): Promise<void> {
    await this.clearChatHistory(sessionUserId);
    delete memChatHistory[sessionUserId];
  }
}

export const assistantRepository = new AssistantRepository();
