import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data in reverse order of foreign key dependencies
  console.log('🧹 Cleaning old data...');
  await prisma.notification.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.deck.deleteMany();
  await prisma.aiChatHistory.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.conceptRelation.deleteMany();
  await prisma.term.deleteMany();
  await prisma.highlight.deleteMany();
  await prisma.document.deleteMany();
  await prisma.screenshot.deleteMany();
  await prisma.audioRecord.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.integrationSetting.deleteMany();

  console.log('✨ Clean complete. Creating base entities...');

  // -------------------------------------------------------------
  // 1. Integration Settings
  // -------------------------------------------------------------
  await prisma.integrationSetting.create({
    data: {
      defaultDeckName: 'LingoAnki Default',
      defaultModelName: 'Basic',
      ankiConnectUrl: 'http://127.0.0.1:8765',
      autoSyncAnki: true,
      obsidianVaultPath: 'C:\\Users\\User\\Documents\\ObsidianVault',
      autoSyncObsidian: false,
      screenshotHotkey: 'windows+shift+s',
      audioHotkey: 'ctrl+shift+a',
      textHotkey: 'ctrl+q',
      vadEnabled: true,
      vadThreshold: 0.5,
      vadSilenceDuration: 1.2,
      vadUseGpu: true,
      marqueeText: '🔥 QUYẾT TÂM!!!!! • Học cái hiểu biết nhiều để biết ơn • Lấy tham thiền làm niềm vui • English learner!',
      marqueeEnabled: true,
      marqueeSpeed: 1.0,
      marqueeDirection: 'left',
    },
  });

  // -------------------------------------------------------------
  // 2. Tags (10 items)
  // -------------------------------------------------------------
  const tagsData = [
    { name: 'IELTS' },
    { name: 'Vocabulary' },
    { name: 'Grammar' },
    { name: 'TypeScript' },
    { name: 'NodeJS' },
    { name: 'Database' },
    { name: 'AI & LLM' },
    { name: 'Speaking' },
    { name: 'Reading' },
    { name: 'Productivity' },
    { name: 'Prisma' },
  ];

  const createdTags = await Promise.all(
    tagsData.map((tag) => prisma.tag.create({ data: tag }))
  );
  const tagMap = new Map(createdTags.map((t) => [t.name, t]));
  console.log(`✅ Created ${createdTags.length} Tags.`);

  // -------------------------------------------------------------
  // 3. Subjects (10 items - 4 parents, 6 children)
  // -------------------------------------------------------------
  const parentSubjectsData = [
    { name: 'English Language', description: 'Comprehensive English language learning and practice' },
    { name: 'Software Engineering', description: 'Computer science, system architecture, and software design' },
    { name: 'Data Science & AI', description: 'Machine learning, neural networks, and data analytics' },
    { name: 'Personal Productivity', description: 'Habit building, time management, and second brain systems' },
  ];

  const parentSubjects = await Promise.all(
    parentSubjectsData.map((s) => prisma.subject.create({ data: s }))
  );
  const subjectMap = new Map(parentSubjects.map((s) => [s.name, s]));

  const childSubjectsData = [
    { name: 'IELTS Preparation', description: 'IELTS Speaking, Academic Reading, and Writing Task 2', parentId: subjectMap.get('English Language')?.id },
    { name: 'English Grammar & Vocab', description: 'Advanced grammar structures and vocabulary expansion', parentId: subjectMap.get('English Language')?.id },
    { name: 'Backend Development', description: 'Node.js, Express, REST API design, and microservices', parentId: subjectMap.get('Software Engineering')?.id },
    { name: 'System Architecture', description: 'Scalable data systems, distributed databases, and caching', parentId: subjectMap.get('Software Engineering')?.id },
    { name: 'Machine Learning & LLMs', description: 'Transformer models, RAG architecture, and fine-tuning', parentId: subjectMap.get('Data Science & AI')?.id },
    { name: 'Time Management & Focus', description: 'Time-blocking, Pomodoro, and distraction elimination', parentId: subjectMap.get('Personal Productivity')?.id },
  ];

  const childSubjects = await Promise.all(
    childSubjectsData.map((s) => prisma.subject.create({ data: s }))
  );
  childSubjects.forEach((s) => subjectMap.set(s.name, s));
  console.log(`✅ Created ${parentSubjects.length + childSubjects.length} Subjects.`);

  // -------------------------------------------------------------
  // 4. StudySessions (10 items)
  // -------------------------------------------------------------
  const now = new Date();
  const studySessionsData = [
    {
      title: 'IELTS Speaking Mock Test Part 2',
      category: 'ENGLISH',
      status: 'COMPLETED',
      aiSummary: 'Practiced cue card on describing a memorable journey. Good fluency, work on past perfect tense.',
      startedAt: new Date(now.getTime() - 24 * 3600 * 1000 * 5),
      endedAt: new Date(now.getTime() - 24 * 3600 * 1000 * 5 + 45 * 60 * 1000),
      tagNames: ['IELTS', 'Speaking', 'Vocabulary'],
    },
    {
      title: 'Reading: Designing Data-Intensive Applications Ch. 3',
      category: 'RESEARCH',
      status: 'COMPLETED',
      aiSummary: 'Covered SSTables, LSM-trees, B-Trees, and index maintenance overhead.',
      startedAt: new Date(now.getTime() - 24 * 3600 * 1000 * 4),
      endedAt: new Date(now.getTime() - 24 * 3600 * 1000 * 4 + 90 * 60 * 1000),
      tagNames: ['Database', 'Reading', 'NodeJS'],
    },
    {
      title: 'Node.js Event Loop & Async Architecture',
      category: 'CODING',
      status: 'COMPLETED',
      aiSummary: 'Analyzed microtask queues, process.nextTick vs Promise.then execution order.',
      startedAt: new Date(now.getTime() - 24 * 3600 * 1000 * 3),
      endedAt: new Date(now.getTime() - 24 * 3600 * 1000 * 3 + 60 * 60 * 1000),
      tagNames: ['NodeJS', 'TypeScript'],
    },
    {
      title: 'Prisma Schema & Relational Modeling',
      category: 'CODING',
      status: 'ACTIVE',
      aiSummary: 'Designing models for Second Brain: Terms, Flashcards, Concept Relations, and Documents.',
      startedAt: new Date(now.getTime() - 24 * 3600 * 1000 * 2),
      tagNames: ['Database', 'TypeScript', 'Prisma'],
    },
    {
      title: 'Daily Shadowing & Intonation Practice',
      category: 'ENGLISH',
      status: 'ACTIVE',
      aiSummary: 'Shadowed Steve Jobs Stanford Commencement Speech snippet. Focusing on connected speech.',
      startedAt: new Date(now.getTime() - 24 * 3600 * 1000 * 1),
      tagNames: ['Speaking', 'Vocabulary'],
    },
    {
      title: 'Team Sync: Product Architecture Review',
      category: 'MEETING',
      status: 'COMPLETED',
      aiSummary: 'Discussed moving audio transcription pipeline to local Whisper model via WebSocket.',
      startedAt: new Date(now.getTime() - 3600 * 1000 * 18),
      endedAt: new Date(now.getTime() - 3600 * 1000 * 17),
      tagNames: ['Productivity', 'AI & LLM'],
    },
    {
      title: 'Lecture: Attention Is All You Need',
      category: 'LECTURE',
      status: 'COMPLETED',
      aiSummary: 'Detailed study of Self-Attention, Multi-Head Attention, and Positional Encoding math.',
      startedAt: new Date(now.getTime() - 3600 * 1000 * 12),
      endedAt: new Date(now.getTime() - 3600 * 1000 * 10),
      tagNames: ['AI & LLM', 'Reading'],
    },
    {
      title: 'Grammar Breakdown: Inversion & Mixed Conditionals',
      category: 'ENGLISH',
      status: 'ACTIVE',
      aiSummary: 'Analyzed formal inverted sentence structures (e.g., "Not only did he...", "Had I known...").',
      startedAt: new Date(now.getTime() - 3600 * 1000 * 6),
      tagNames: ['Grammar', 'IELTS'],
    },
    {
      title: 'Deep Work: Building Second Brain Pipeline',
      category: 'CODING',
      status: 'PAUSED',
      aiSummary: 'Implemented hotkey capture for screen context and audio recording integration.',
      startedAt: new Date(now.getTime() - 3600 * 1000 * 3),
      tagNames: ['Productivity', 'TypeScript'],
    },
    {
      title: 'Book Club: Atomic Habits Chapter 4',
      category: 'READING',
      status: 'COMPLETED',
      aiSummary: 'Explored the 4 Laws of Behavior Change: Make it Obvious, Attractive, Easy, Satisfying.',
      startedAt: new Date(now.getTime() - 3600 * 1000 * 1),
      endedAt: new Date(now.getTime() - 3600 * 1000 * 0.5),
      tagNames: ['Productivity', 'Reading'],
    },
  ];

  const createdSessions = await Promise.all(
    studySessionsData.map(async (session) => {
      const { tagNames, ...data } = session;
      return prisma.studySession.create({
        data: {
          ...data,
          tags: {
            connect: tagNames.map((name) => ({ id: tagMap.get(name)!.id })),
          },
        },
      });
    })
  );
  console.log(`✅ Created ${createdSessions.length} StudySessions.`);

  // -------------------------------------------------------------
  // 5. Screenshots (10 items)
  // -------------------------------------------------------------
  const screenshotsData = [
    {
      filename: 'screenshot_20260901_101500.png',
      originalName: 'IELTS_Band9_Essay_Sample.png',
      extractedText: 'The phenomenon of urbanization has profoundly reshaped demographic landscapes worldwide. Consequently, municipal authorities face unprecedented challenges in infrastructure management.',
      windowTitle: 'Chrome - IELTS Academic Writing Model Answers',
      sessionId: createdSessions[0].id,
    },
    {
      filename: 'screenshot_20260902_142030.png',
      originalName: 'LSM_Tree_Architecture.png',
      extractedText: 'Log-Structured Merge-tree (LSM tree) is a data structure designed to provide low-cost writes compared to traditional B-trees.',
      windowTitle: 'PDF Viewer - Designing Data-Intensive Applications',
      sessionId: createdSessions[1].id,
    },
    {
      filename: 'screenshot_20260903_093012.png',
      originalName: 'Node_Event_Loop_Diagram.png',
      extractedText: 'Phases of Event Loop: Timers -> Pending Callbacks -> Idle/Prepare -> Poll -> Check -> Close Callbacks.',
      windowTitle: 'VSCode - nodejs-core-notes.md',
      sessionId: createdSessions[2].id,
    },
    {
      filename: 'screenshot_20260904_110544.png',
      originalName: 'Prisma_Relation_Syntax.png',
      extractedText: 'model Term { id String @id ... outgoing ConceptRelation[] @relation("SourceConcept") }',
      windowTitle: 'VSCode - schema.prisma',
      sessionId: createdSessions[3].id,
    },
    {
      filename: 'screenshot_20260905_160000.png',
      originalName: 'Connected_Speech_Rules.png',
      extractedText: 'Assimilation occurs when a phoneme changes its quality to become more similar to a neighboring sound.',
      windowTitle: 'Browser - English Phonetics & Phonology',
      sessionId: createdSessions[4].id,
    },
    {
      filename: 'screenshot_20260906_100000.png',
      originalName: 'System_Architecture_Diagram.png',
      extractedText: 'Client Desktop App -> API Gateway (Express) -> Whisper WS / Redis PubSub -> SQLite DB.',
      windowTitle: 'Excalidraw - System Design',
      sessionId: createdSessions[5].id,
    },
    {
      filename: 'screenshot_20260906_143000.png',
      originalName: 'MultiHead_Attention_Formula.png',
      extractedText: 'MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W^O where head_i = Attention(Q * W_i^Q, K * W_i^K, V * W_i^V)',
      windowTitle: 'PDF - Attention Is All You Need.pdf',
      sessionId: createdSessions[6].id,
    },
    {
      filename: 'screenshot_20260907_081520.png',
      originalName: 'Inversion_Grammar_Chart.png',
      extractedText: 'Hardly had I arrived when the phone rang. Scarcely had she finished speaking when...',
      windowTitle: 'Notion - Advanced English Grammar',
      sessionId: createdSessions[7].id,
    },
    {
      filename: 'screenshot_20260907_120000.png',
      originalName: 'Global_Hotkey_Handler.png',
      extractedText: 'registerGlobalHotkeys() { uIOhook.on("keydown", (e) => handleShortcut(e)); }',
      windowTitle: 'WebStorm - hotkey.service.ts',
      sessionId: createdSessions[8].id,
    },
    {
      filename: 'screenshot_20260907_174500.png',
      originalName: 'Habit_Loop_Diagram.png',
      extractedText: 'The Habit Loop: Cue -> Craving -> Response -> Reward. Identity-based habits focus on who you wish to become.',
      windowTitle: 'Kindle Reader - Atomic Habits',
      sessionId: createdSessions[9].id,
    },
  ];

  const createdScreenshots = await Promise.all(
    screenshotsData.map((s) => prisma.screenshot.create({ data: s }))
  );
  console.log(`✅ Created ${createdScreenshots.length} Screenshots.`);

  // -------------------------------------------------------------
  // 6. AudioRecords (10 items)
  // -------------------------------------------------------------
  const audioRecordsData = [
    {
      filename: 'audio_20260901_103000.wav',
      originalName: 'IELTS_Part2_Speaking_Recording.wav',
      extractedText: 'I would like to describe a memorable trip I took to Da Nang last summer with my closest friends.',
      duration: 124.5,
      sessionId: createdSessions[0].id,
    },
    {
      filename: 'audio_20260902_150000.mp3',
      originalName: 'LSM_Tree_Voice_Note.mp3',
      extractedText: 'LSM trees batch up sequential writes in memory before flushing to disk tables.',
      duration: 45.0,
      sessionId: createdSessions[1].id,
    },
    {
      filename: 'audio_20260903_100000.wav',
      originalName: 'Event_Loop_Summary_Voice.wav',
      extractedText: 'Remember that microtasks in promise callbacks execute immediately after current synchronous script finishes.',
      duration: 62.0,
      sessionId: createdSessions[2].id,
    },
    {
      filename: 'audio_20260904_113000.wav',
      originalName: 'Prisma_Cascade_Note.wav',
      extractedText: 'On delete cascade removes child relation records automatically when parent record is deleted.',
      duration: 38.2,
      sessionId: createdSessions[3].id,
    },
    {
      filename: 'audio_20260905_163000.wav',
      originalName: 'Shadowing_SteveJobs_Clip.wav',
      extractedText: 'You cant connect the dots looking forward; you can only connect them looking backward.',
      duration: 18.5,
      sessionId: createdSessions[4].id,
    },
    {
      filename: 'audio_20260906_103000.mp3',
      originalName: 'Arch_Meeting_Snippet.mp3',
      extractedText: 'We agreed to decouple the desktop app UI thread from real-time audio transcription processing.',
      duration: 180.0,
      sessionId: createdSessions[5].id,
    },
    {
      filename: 'audio_20260906_150000.wav',
      originalName: 'Self_Attention_Explanation.wav',
      extractedText: 'Query, Key, and Value matrices allow each word to compute attention weights against all other words in the sentence.',
      duration: 85.4,
      sessionId: createdSessions[6].id,
    },
    {
      filename: 'audio_20260907_084500.wav',
      originalName: 'Inversion_Drills.wav',
      extractedText: 'Seldom have I witnessed such dedication. Under no circumstances should you surrender your goals.',
      duration: 52.0,
      sessionId: createdSessions[7].id,
    },
    {
      filename: 'audio_20260907_123000.wav',
      originalName: 'SecondBrain_Thought.wav',
      extractedText: 'Capturing thoughts instantly via global hotkey eliminates cognitive load and distraction while reading.',
      duration: 40.0,
      sessionId: createdSessions[8].id,
    },
    {
      filename: 'audio_20260907_180000.wav',
      originalName: 'AtomicHabits_Reflection.wav',
      extractedText: 'Habit stacking is pairing a new habit with a current habit you already execute automatically.',
      duration: 33.6,
      sessionId: createdSessions[9].id,
    },
  ];

  const createdAudioRecords = await Promise.all(
    audioRecordsData.map((a) => prisma.audioRecord.create({ data: a }))
  );
  console.log(`✅ Created ${createdAudioRecords.length} AudioRecords.`);

  // -------------------------------------------------------------
  // 7. Documents (10 items)
  // -------------------------------------------------------------
  const documentsData = [
    {
      title: 'Official IELTS Practice Materials 2024',
      author: 'Cambridge Assessment English',
      publishedYear: 2024,
      fileType: 'PDF',
      localPath: 'C:\\Docs\\IELTS_Official_2024.pdf',
      sourceUrl: 'https://cambridgeenglish.org/ielts',
      status: 'READING',
      readingProgress: 'Page 45/120',
      subjectId: subjectMap.get('IELTS Preparation')?.id,
      studySessionId: createdSessions[0].id,
      tagNames: ['IELTS', 'Speaking', 'Reading'],
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      publishedYear: 2017,
      fileType: 'EPUB',
      localPath: 'C:\\Docs\\Designing_Data_Intensive_Apps.epub',
      sourceUrl: 'https://dataintensive.net',
      status: 'READING',
      readingProgress: '65%',
      subjectId: subjectMap.get('System Architecture')?.id,
      studySessionId: createdSessions[1].id,
      tagNames: ['Database', 'Reading', 'NodeJS'],
    },
    {
      title: 'English Grammar in Use 5th Edition',
      author: 'Raymond Murphy',
      publishedYear: 2019,
      fileType: 'PDF',
      localPath: 'C:\\Docs\\English_Grammar_Murphy.pdf',
      status: 'COMPLETED',
      readingProgress: '100%',
      subjectId: subjectMap.get('English Grammar & Vocab')?.id,
      studySessionId: createdSessions[7].id,
      tagNames: ['Grammar', 'Vocabulary'],
    },
    {
      title: 'Clean Architecture: A Craftsman Guide',
      author: 'Robert C. Martin',
      publishedYear: 2017,
      fileType: 'PDF',
      localPath: 'C:\\Docs\\Clean_Architecture.pdf',
      status: 'READING',
      readingProgress: 'Page 112/350',
      subjectId: subjectMap.get('Backend Development')?.id,
      studySessionId: createdSessions[5].id,
      tagNames: ['TypeScript', 'NodeJS'],
    },
    {
      title: 'Attention Is All You Need (Paper)',
      author: 'Vaswani et al.',
      publishedYear: 2017,
      fileType: 'URL',
      sourceUrl: 'https://arxiv.org/abs/1706.03762',
      status: 'COMPLETED',
      readingProgress: 'Page 12/12',
      subjectId: subjectMap.get('Machine Learning & LLMs')?.id,
      studySessionId: createdSessions[6].id,
      tagNames: ['AI & LLM', 'Reading'],
    },
    {
      title: 'Node.js Design Patterns 3rd Ed',
      author: 'Mario Casciaro',
      publishedYear: 2020,
      fileType: 'PDF',
      localPath: 'C:\\Docs\\Nodejs_Design_Patterns.pdf',
      status: 'UNREAD',
      readingProgress: '0%',
      subjectId: subjectMap.get('Backend Development')?.id,
      studySessionId: createdSessions[2].id,
      tagNames: ['NodeJS', 'TypeScript'],
    },
    {
      title: 'Atomic Habits: An Easy & Proven Way',
      author: 'James Clear',
      publishedYear: 2018,
      fileType: 'EPUB',
      localPath: 'C:\\Docs\\Atomic_Habits.epub',
      status: 'COMPLETED',
      readingProgress: '100%',
      subjectId: subjectMap.get('Time Management & Focus')?.id,
      studySessionId: createdSessions[9].id,
      tagNames: ['Productivity', 'Reading'],
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt & David Thomas',
      publishedYear: 2019,
      fileType: 'PDF',
      localPath: 'C:\\Docs\\Pragmatic_Programmer.pdf',
      status: 'READING',
      readingProgress: 'Page 89/320',
      subjectId: subjectMap.get('Fullstack Web Development')?.id,
      tagNames: ['Productivity', 'TypeScript'],
    },
    {
      title: 'Refactoring: Improving Code Design',
      author: 'Martin Fowler',
      publishedYear: 2018,
      fileType: 'PDF',
      localPath: 'C:\\Docs\\Refactoring_Fowler.pdf',
      status: 'UNREAD',
      readingProgress: '0%',
      subjectId: subjectMap.get('Backend Development')?.id,
      tagNames: ['TypeScript'],
    },
    {
      title: 'High-Performance Browser Networking',
      author: 'Ilya Grigorik',
      publishedYear: 2013,
      fileType: 'URL',
      sourceUrl: 'https://hpbn.co',
      status: 'COMPLETED',
      readingProgress: '100%',
      subjectId: subjectMap.get('System Architecture')?.id,
      tagNames: ['NodeJS', 'Database'],
    },
  ];

  const createdDocuments = await Promise.all(
    documentsData.map(async (doc) => {
      const { tagNames, ...data } = doc;
      return prisma.document.create({
        data: {
          ...data,
          tags: {
            connect: tagNames.map((name) => ({ id: tagMap.get(name)!.id })),
          },
        },
      });
    })
  );
  console.log(`✅ Created ${createdDocuments.length} Documents.`);

  // -------------------------------------------------------------
  // 8. Highlights (10 items)
  // -------------------------------------------------------------
  const highlightsData = [
    {
      documentId: createdDocuments[1].id, // DDIA
      text: 'Reliability means making systems keep working correctly, even in the face of adversity.',
      aiParaphrase: 'A reliable system functions accurately despite hardware or software faults.',
      aiSummary: 'Definition of System Reliability',
      pageNumber: 'P. 6',
    },
    {
      documentId: createdDocuments[1].id, // DDIA
      text: 'Scalability is the term we use to describe a system ability to cope with increased load.',
      aiParaphrase: 'Scalability measures how well a system handles growing demand.',
      aiSummary: 'Scalability core concept',
      pageNumber: 'P. 11',
    },
    {
      documentId: createdDocuments[2].id, // Murphy Grammar
      text: 'We use the present perfect for an action in the past with a result now in the present.',
      aiParaphrase: 'Present perfect links a past event with a current state.',
      aiSummary: 'Present Perfect tense rule',
      pageNumber: 'P. 14',
    },
    {
      documentId: createdDocuments[2].id, // Murphy Grammar
      text: 'Had I known about the delayed flight, I would have taken the train.',
      aiParaphrase: 'Inverted third conditional used for past unreal hypothetical situations.',
      aiSummary: 'Inversion in 3rd conditional',
      pageNumber: 'P. 202',
    },
    {
      documentId: createdDocuments[3].id, // Clean Architecture
      text: 'The center of your application is not the database. Nor is it one or more of the frameworks.',
      aiParaphrase: 'Core business logic should remain independent of databases and frameworks.',
      aiSummary: 'Framework Independence',
      pageNumber: 'P. 135',
    },
    {
      documentId: createdDocuments[3].id, // Clean Architecture
      text: 'Good architecture allows decisions about frameworks, databases, and servers to be delayed.',
      aiParaphrase: 'Postponing infrastructure choices keeps options flexible.',
      aiSummary: 'Deferring architectural decisions',
      pageNumber: 'P. 140',
    },
    {
      documentId: createdDocuments[6].id, // Atomic Habits
      text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
      aiParaphrase: 'Focusing on repeatable processes yields better outcomes than static goals.',
      aiSummary: 'Systems vs Goals',
      pageNumber: 'P. 27',
    },
    {
      documentId: createdDocuments[6].id, // Atomic Habits
      text: 'Every action you take is a vote for the type of person you wish to become.',
      aiParaphrase: 'Small daily habits incrementally build your core identity.',
      aiSummary: 'Identity-based habits',
      pageNumber: 'P. 38',
    },
    {
      documentId: createdDocuments[4].id, // Attention Paper
      text: 'Self-attention is an attention mechanism relating different positions of a single sequence.',
      aiParaphrase: 'Self-attention computes token-to-token contextual relationships within one sequence.',
      aiSummary: 'Self-Attention Mechanism',
      pageNumber: 'P. 3',
    },
    {
      documentId: createdDocuments[4].id, // Attention Paper
      text: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces.',
      aiParaphrase: 'Parallel attention heads capture diverse semantic relations simultaneously.',
      aiSummary: 'Multi-Head Attention',
      pageNumber: 'P. 5',
    },
  ];

  const createdHighlights = await Promise.all(
    highlightsData.map((h) => prisma.highlight.create({ data: h }))
  );
  console.log(`✅ Created ${createdHighlights.length} Highlights.`);

  // -------------------------------------------------------------
  // 9. Terms (12 items)
  // -------------------------------------------------------------
  const termsData = [
    {
      termType: 'VOCAB',
      sourceType: 'READING',
      documentId: createdDocuments[0].id,
      sessionId: createdSessions[0].id,
      term: 'Profoundly',
      contextSentence: 'The phenomenon of urbanization has profoundly reshaped demographic landscapes worldwide.',
      aiExplanation: JSON.stringify({
        phonetic: '/prəˈfaʊnd.li/',
        partOfSpeech: 'adverb',
        definition: 'To a profound extent; extremely or deeply.',
        vietnameseTranslation: 'Một cách sâu sắc, vô cùng',
        examples: ['The discovery profoundly altered our understanding of the universe.'],
        synonyms: ['deeply', 'immensely', 'thoroughly'],
      }),
      ankiSyncStatus: 'SYNCED',
      obsidianSyncStatus: 'SYNCED',
      tagNames: ['IELTS', 'Vocabulary'],
    },
    {
      termType: 'VOCAB',
      sourceType: 'READING',
      documentId: createdDocuments[0].id,
      sessionId: createdSessions[0].id,
      term: 'Unprecedented',
      contextSentence: 'Municipal authorities face unprecedented challenges in infrastructure management.',
      aiExplanation: JSON.stringify({
        phonetic: '/ʌnˈpres.ɪ.den.tɪd/',
        partOfSpeech: 'adjective',
        definition: 'Never done or known before.',
        vietnameseTranslation: 'Chưa từng có, chưa từng xảy ra',
        examples: ['The team achieved an unprecedented level of success this season.'],
        synonyms: ['unmatched', 'unrivaled', 'unexampled'],
      }),
      ankiSyncStatus: 'SYNCED',
      obsidianSyncStatus: 'SYNCED',
      tagNames: ['IELTS', 'Vocabulary'],
    },
    {
      termType: 'CONCEPT',
      sourceType: 'READING',
      documentId: createdDocuments[1].id,
      sessionId: createdSessions[1].id,
      screenshotId: createdScreenshots[1].id,
      audioRecordId: createdAudioRecords[1].id,
      term: 'LSM Tree',
      contextSentence: 'Log-Structured Merge-tree (LSM tree) provides fast writes by appending sequential log files.',
      aiExplanation: JSON.stringify({
        definition: 'A data structure optimized for write-heavy database engines by appending data sequentially in memory (MemTable) before flushing to disk (SSTables).',
        vietnameseTranslation: 'Cấu trúc dữ liệu cây gộp ghi nhật ký',
        keyComponents: ['MemTable', 'SSTable', 'Write-Ahead Log (WAL)', 'Compaction'],
      }),
      ankiSyncStatus: 'SYNCED',
      obsidianSyncStatus: 'PENDING',
      tagNames: ['Database', 'NodeJS'],
    },
    {
      termType: 'CONCEPT',
      sourceType: 'SCREENSHOT',
      documentId: createdDocuments[1].id,
      sessionId: createdSessions[1].id,
      screenshotId: createdScreenshots[1].id,
      term: 'SSTable',
      contextSentence: 'Sorted String Table (SSTable) is an immutable key-value map file stored on disk, sorted by key.',
      aiExplanation: JSON.stringify({
        definition: 'A file format for storing key-value pairs sorted by key, allowing efficient binary search and range queries on disk.',
        vietnameseTranslation: 'Bảng chuỗi đã sắp xếp',
        keyComponents: ['Sorted Keys', 'Sparse Index', 'Bloom Filter'],
      }),
      ankiSyncStatus: 'SYNCED',
      obsidianSyncStatus: 'PENDING',
      tagNames: ['Database'],
    },
    {
      termType: 'CONCEPT',
      sourceType: 'SCREENSHOT',
      documentId: createdDocuments[2].id,
      sessionId: createdSessions[7].id,
      screenshotId: createdScreenshots[7].id,
      audioRecordId: createdAudioRecords[7].id,
      term: 'Subject-Auxiliary Inversion',
      contextSentence: 'Hardly had I arrived when the phone rang.',
      aiExplanation: JSON.stringify({
        definition: 'A grammatical rule where the auxiliary verb precedes the subject, commonly triggered by negative adverbials placed at the beginning of a sentence.',
        vietnameseTranslation: 'Đảo ngữ Động từ phụ - Chủ ngữ',
        triggers: ['Hardly', 'Scarcely', 'Seldom', 'Never', 'Not only'],
      }),
      ankiSyncStatus: 'PENDING',
      obsidianSyncStatus: 'PENDING',
      tagNames: ['Grammar', 'IELTS'],
    },
    {
      termType: 'CONCEPT',
      sourceType: 'READING',
      documentId: createdDocuments[4].id,
      sessionId: createdSessions[6].id,
      screenshotId: createdScreenshots[6].id,
      audioRecordId: createdAudioRecords[6].id,
      term: 'Self-Attention Mechanism',
      contextSentence: 'Self-attention calculates weighted connections between all tokens in a sequence.',
      aiExplanation: JSON.stringify({
        definition: 'An attention module that computes dynamic pairwise relationships between tokens in a sequence using Query, Key, and Value vector dot-products.',
        vietnameseTranslation: 'Cơ chế Tự-Chú-Ý (Self-Attention)',
        formula: 'Softmax(Q * K^T / sqrt(d_k)) * V',
      }),
      ankiSyncStatus: 'SYNCED',
      obsidianSyncStatus: 'SYNCED',
      tagNames: ['AI & LLM'],
    },
    {
      termType: 'CONCEPT',
      sourceType: 'READING',
      documentId: createdDocuments[4].id,
      sessionId: createdSessions[6].id,
      term: 'Multi-Head Attention',
      contextSentence: 'Multi-head attention projects Queries, Keys, and Values into multiple subspaces in parallel.',
      aiExplanation: JSON.stringify({
        definition: 'An extension of self-attention that runs multiple attention operations (heads) in parallel, allowing the model to capture multiple relationships.',
        vietnameseTranslation: 'Cơ chế Chú ý Đa đầu (Multi-Head Attention)',
      }),
      ankiSyncStatus: 'SYNCED',
      obsidianSyncStatus: 'PENDING',
      tagNames: ['AI & LLM'],
    },
    {
      termType: 'VOCAB',
      sourceType: 'AUDIO',
      audioRecordId: createdAudioRecords[4].id,
      sessionId: createdSessions[4].id,
      term: 'Assimilation',
      contextSentence: 'Assimilation occurs when a phoneme changes its quality to sound more like a neighboring sound.',
      aiExplanation: JSON.stringify({
        phonetic: '/əˌsɪm.ɪˈleɪ.ʃən/',
        partOfSpeech: 'noun',
        definition: 'The process by which one sound becomes similar to a neighboring sound in fluent speech.',
        vietnameseTranslation: 'Hiện tượng đồng hóa âm trong phát âm',
        examples: ['In "ten bucks", /n/ often assimilates to /m/ sounding like "tem bucks".'],
      }),
      ankiSyncStatus: 'SYNCED',
      obsidianSyncStatus: 'SYNCED',
      tagNames: ['Speaking', 'Vocabulary'],
    },
    {
      termType: 'VOCAB',
      sourceType: 'READING',
      documentId: createdDocuments[6].id,
      sessionId: createdSessions[9].id,
      audioRecordId: createdAudioRecords[9].id,
      term: 'Habit Stacking',
      contextSentence: 'Habit stacking is pairing a new habit with an established cue.',
      aiExplanation: JSON.stringify({
        definition: 'A productivity strategy where you link a desired new behavior to an existing automatic daily habit.',
        vietnameseTranslation: 'Kỹ thuật Xếp chồng Thói quen',
        formula: 'After [CURRENT HABIT], I will [NEW HABIT].',
      }),
      ankiSyncStatus: 'PENDING',
      obsidianSyncStatus: 'PENDING',
      tagNames: ['Productivity'],
    },
    {
      termType: 'CONCEPT',
      sourceType: 'SCREENSHOT',
      screenshotId: createdScreenshots[2].id,
      audioRecordId: createdAudioRecords[2].id,
      sessionId: createdSessions[2].id,
      term: 'Microtask Queue',
      contextSentence: 'Microtasks in promise callbacks execute immediately after current synchronous script finishes.',
      aiExplanation: JSON.stringify({
        definition: 'A high-priority execution queue in Node.js/Browser JavaScript engine for Promises and process.nextTick, drained before macrotask event loop phases.',
        vietnameseTranslation: 'Hàng đợi Microtask trong JS',
      }),
      ankiSyncStatus: 'SYNCED',
      obsidianSyncStatus: 'SYNCED',
      tagNames: ['NodeJS', 'TypeScript'],
    },
    {
      termType: 'VOCAB',
      sourceType: 'MANUAL',
      term: 'Ubiquitous',
      contextSentence: 'Smartphones have become ubiquitous in modern society.',
      aiExplanation: JSON.stringify({
        phonetic: '/juːˈbɪk.wə.təs/',
        partOfSpeech: 'adjective',
        definition: 'Present, appearing, or found everywhere.',
        vietnameseTranslation: 'Phổ biến khắp nơi, có mặt ở khắp mọi nơi',
        examples: ['Digital screens are now ubiquitous in daily life.'],
        synonyms: ['omnipresent', 'pervasive', 'universal'],
      }),
      ankiSyncStatus: 'PENDING',
      obsidianSyncStatus: 'PENDING',
      tagNames: ['Vocabulary', 'IELTS'],
    },
    {
      termType: 'VOCAB',
      sourceType: 'MANUAL',
      term: 'Epistemology',
      contextSentence: 'Epistemology studies the nature, origin, and limits of human knowledge.',
      aiExplanation: JSON.stringify({
        phonetic: '/ɪˌpɪs.təˈmɒl.ə.dʒi/',
        partOfSpeech: 'noun',
        definition: 'The branch of philosophy concerned with knowledge.',
        vietnameseTranslation: 'Nhận thức luận',
        examples: ['His research explores the epistemology of artificial intelligence.'],
      }),
      ankiSyncStatus: 'PENDING',
      obsidianSyncStatus: 'PENDING',
      tagNames: ['Vocabulary'],
    },
  ];

  const createdTerms = await Promise.all(
    termsData.map(async (term) => {
      const { tagNames, ...data } = term;
      return prisma.term.create({
        data: {
          ...data,
          tags: {
            connect: tagNames.map((name) => ({ id: tagMap.get(name)!.id })),
          },
        },
      });
    })
  );
  const termMap = new Map(createdTerms.map((t) => [t.term, t]));
  console.log(`✅ Created ${createdTerms.length} Terms.`);

  // -------------------------------------------------------------
  // 10. ConceptRelations (10 items)
  // -------------------------------------------------------------
  const conceptRelationsData = [
    {
      sessionId: createdSessions[1].id,
      sourceTermId: termMap.get('LSM Tree')!.id,
      targetTermId: termMap.get('SSTable')!.id,
      relationType: 'CONTAINS',
    },
    {
      sessionId: createdSessions[6].id,
      sourceTermId: termMap.get('Multi-Head Attention')!.id,
      targetTermId: termMap.get('Self-Attention Mechanism')!.id,
      relationType: 'USES',
    },
    {
      sessionId: createdSessions[0].id,
      sourceTermId: termMap.get('Profoundly')!.id,
      targetTermId: termMap.get('Unprecedented')!.id,
      relationType: 'RELATED_TO',
    },
    {
      sessionId: createdSessions[2].id,
      sourceTermId: termMap.get('Microtask Queue')!.id,
      targetTermId: termMap.get('LSM Tree')!.id,
      relationType: 'RELATED_TO',
    },
    {
      sessionId: createdSessions[7].id,
      sourceTermId: termMap.get('Subject-Auxiliary Inversion')!.id,
      targetTermId: termMap.get('Profoundly')!.id,
      relationType: 'RELATED_TO',
    },
    {
      sessionId: createdSessions[4].id,
      sourceTermId: termMap.get('Assimilation')!.id,
      targetTermId: termMap.get('Profoundly')!.id,
      relationType: 'RELATED_TO',
    },
    {
      sessionId: createdSessions[9].id,
      sourceTermId: termMap.get('Habit Stacking')!.id,
      targetTermId: termMap.get('Ubiquitous')!.id,
      relationType: 'LEADS_TO',
    },
    {
      sessionId: createdSessions[1].id,
      sourceTermId: termMap.get('SSTable')!.id,
      targetTermId: termMap.get('Microtask Queue')!.id,
      relationType: 'DEPENDS_ON',
    },
    {
      sessionId: createdSessions[6].id,
      sourceTermId: termMap.get('Self-Attention Mechanism')!.id,
      targetTermId: termMap.get('Epistemology')!.id,
      relationType: 'RELATED_TO',
    },
    {
      sessionId: createdSessions[0].id,
      sourceTermId: termMap.get('Unprecedented')!.id,
      targetTermId: termMap.get('Subject-Auxiliary Inversion')!.id,
      relationType: 'RELATED_TO',
    },
  ];

  const createdRelations = await Promise.all(
    conceptRelationsData.map((r) => prisma.conceptRelation.create({ data: r }))
  );
  console.log(`✅ Created ${createdRelations.length} ConceptRelations.`);

  // -------------------------------------------------------------
  // 11. Decks & Flashcards (5 Decks, 10 Flashcards)
  // -------------------------------------------------------------
  const decksData = [
    { name: 'IELTS Core Vocabulary', description: 'Band 8.0+ Academic Words and Collocations' },
    { name: 'System Architecture & DB', description: 'Database design, LSM trees, indexing, and storage engines' },
    { name: 'English Grammar & Structures', description: 'Advanced grammar patterns, inversions, and conditionals' },
    { name: 'AI & Machine Learning Terms', description: 'Transformers, attention mechanisms, and neural nets' },
    { name: 'Productivity & Second Brain', description: 'Habit formation principles and personal knowledge management' },
  ];

  const createdDecks = await Promise.all(
    decksData.map((d) => prisma.deck.create({ data: d }))
  );
  const deckMap = new Map(createdDecks.map((d) => [d.name, d]));
  console.log(`✅ Created ${createdDecks.length} Decks.`);

  const flashcardsData = [
    {
      termId: termMap.get('Profoundly')!.id,
      deckId: deckMap.get('IELTS Core Vocabulary')!.id,
      front: 'What does "Profoundly" mean?',
      back: 'Adverb: To a profound extent; extremely or deeply. (VN: Một cách sâu sắc, vô cùng)',
      interval: 3,
      repetition: 2,
      easeFactor: 2.6,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 3),
    },
    {
      termId: termMap.get('Unprecedented')!.id,
      deckId: deckMap.get('IELTS Core Vocabulary')!.id,
      front: 'What does "Unprecedented" mean?',
      back: 'Adjective: Never done or known before. (VN: Chưa từng có)',
      interval: 5,
      repetition: 3,
      easeFactor: 2.5,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 5),
    },
    {
      termId: termMap.get('LSM Tree')!.id,
      deckId: deckMap.get('System Architecture & DB')!.id,
      front: 'What is an LSM Tree?',
      back: 'Log-Structured Merge-tree: A write-optimized data structure that buffers writes in memory (MemTable) before appending sequentially to SSTables on disk.',
      interval: 1,
      repetition: 1,
      easeFactor: 2.4,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 1),
    },
    {
      termId: termMap.get('SSTable')!.id,
      deckId: deckMap.get('System Architecture & DB')!.id,
      front: 'What is an SSTable in database engines?',
      back: 'Sorted String Table: An immutable file stored on disk containing key-value pairs sorted by key.',
      interval: 4,
      repetition: 2,
      easeFactor: 2.5,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 4),
    },
    {
      termId: termMap.get('Subject-Auxiliary Inversion')!.id,
      deckId: deckMap.get('English Grammar & Structures')!.id,
      front: 'Give an example of Subject-Auxiliary Inversion with "Hardly".',
      back: 'Hardly had I arrived when the phone rang.',
      interval: 2,
      repetition: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 2),
    },
    {
      termId: termMap.get('Self-Attention Mechanism')!.id,
      deckId: deckMap.get('AI & Machine Learning Terms')!.id,
      front: 'What is the formula for Self-Attention?',
      back: 'Attention(Q, K, V) = Softmax( (Q * K^T) / sqrt(d_k) ) * V',
      interval: 6,
      repetition: 4,
      easeFactor: 2.7,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 6),
    },
    {
      termId: termMap.get('Multi-Head Attention')!.id,
      deckId: deckMap.get('AI & Machine Learning Terms')!.id,
      front: 'Why do Transformers use Multi-Head Attention?',
      back: 'It allows the model to attend to information from different representation subspaces at different positions simultaneously.',
      interval: 3,
      repetition: 2,
      easeFactor: 2.5,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 3),
    },
    {
      termId: termMap.get('Assimilation')!.id,
      deckId: deckMap.get('IELTS Core Vocabulary')!.id,
      front: 'What is Assimilation in English phonetics?',
      back: 'A sound change where a phoneme changes to become more similar to a adjacent sound (e.g. "ten bucks" -> "tem bucks").',
      interval: 5,
      repetition: 3,
      easeFactor: 2.6,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 5),
    },
    {
      termId: termMap.get('Habit Stacking')!.id,
      deckId: deckMap.get('Productivity & Second Brain')!.id,
      front: 'What is the formula for Habit Stacking?',
      back: 'After [CURRENT HABIT], I will [NEW HABIT].',
      interval: 7,
      repetition: 4,
      easeFactor: 2.8,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 7),
    },
    {
      termId: termMap.get('Microtask Queue')!.id,
      deckId: deckMap.get('System Architecture & DB')!.id,
      front: 'When does the Node.js Microtask Queue run?',
      back: 'Immediately after the currently executing synchronous script completes and before moving to the next Macrotask event loop phase.',
      interval: 4,
      repetition: 2,
      easeFactor: 2.5,
      nextReviewDate: new Date(now.getTime() + 24 * 3600 * 1000 * 4),
    },
  ];

  const createdFlashcards = await Promise.all(
    flashcardsData.map((f) => prisma.flashcard.create({ data: f }))
  );
  console.log(`✅ Created ${createdFlashcards.length} Flashcards.`);

  // -------------------------------------------------------------
  // 12. ChatSessions & AiChatHistory (10 ChatSessions, 15 Messages)
  // -------------------------------------------------------------
  const chatSessionsData = [
    {
      title: 'Explain Inversion Grammar Rules',
      sourceType: 'READING',
      documentId: createdDocuments[2].id,
      sessionId: createdSessions[7].id,
    },
    {
      title: 'Analyze LSM Tree vs B-Tree',
      sourceType: 'READING',
      documentId: createdDocuments[1].id,
      sessionId: createdSessions[1].id,
    },
    {
      title: 'Feedback on IELTS Cue Card Speaking',
      sourceType: 'AUDIO',
      audioRecordId: createdAudioRecords[0].id,
      sessionId: createdSessions[0].id,
    },
    {
      title: 'Explain Screenshot Text: Code Architecture',
      sourceType: 'SCREENSHOT',
      screenshotId: createdScreenshots[5].id,
      sessionId: createdSessions[5].id,
    },
    {
      title: 'Transformer Attention Math Breakdown',
      sourceType: 'READING',
      documentId: createdDocuments[4].id,
      sessionId: createdSessions[6].id,
    },
    {
      title: 'Habit Building Strategy Consultation',
      sourceType: 'GENERAL',
      sessionId: createdSessions[9].id,
    },
    {
      title: 'General English Vocab Inquiry',
      sourceType: 'GENERAL',
    },
    {
      title: 'Node.js Microtasks vs Macrotasks',
      sourceType: 'GENERAL',
      sessionId: createdSessions[2].id,
    },
    {
      title: 'Prisma Schema Relation Troubleshooting',
      sourceType: 'SCREENSHOT',
      screenshotId: createdScreenshots[3].id,
    },
    {
      title: 'IELTS Band 8 Writing Paraphrasing',
      sourceType: 'SCREENSHOT',
      screenshotId: createdScreenshots[0].id,
    },
  ];

  const createdChatSessions = await Promise.all(
    chatSessionsData.map((c) => prisma.chatSession.create({ data: c }))
  );
  console.log(`✅ Created ${createdChatSessions.length} ChatSessions.`);

  const chatMessagesData = [
    {
      chatSessionId: createdChatSessions[0].id,
      role: 'USER',
      message: 'Can you explain when to use negative inversion in English with examples?',
    },
    {
      chatSessionId: createdChatSessions[0].id,
      role: 'ASSISTANT',
      message: 'Negative inversion is used for emphasis or dramatic effect in formal speech and writing. It happens when negative words like *Seldom*, *Rarely*, *Hardly*, or *Under no circumstances* start a sentence.',
      extractedData: JSON.stringify({
        rule: 'Negative Adverbial + Auxiliary Verb + Subject + Main Verb',
        examples: ['Seldom have I seen such dedication.', 'Hardly had she left when the storm started.'],
      }),
    },
    {
      chatSessionId: createdChatSessions[1].id,
      role: 'USER',
      message: 'What is the primary advantage of LSM Trees over traditional B-Trees?',
    },
    {
      chatSessionId: createdChatSessions[1].id,
      role: 'ASSISTANT',
      message: 'LSM Trees convert random write operations into sequential disk writes by buffering in memory and appending logs, making write throughput significantly higher than B-Trees.',
      extractedData: JSON.stringify({
        comparison: { LSM: 'High Write Throughput', BTree: 'Fast Point Reads' },
      }),
    },
    {
      chatSessionId: createdChatSessions[2].id,
      role: 'USER',
      message: 'Please evaluate my audio speaking recording for IELTS Part 2.',
    },
    {
      chatSessionId: createdChatSessions[2].id,
      role: 'ASSISTANT',
      message: 'Your speech was fluent with an estimated score of 7.5. Great use of descriptive vocabulary like "picturesque" and "breathtaking". Watch out for past tense consistency.',
      extractedData: JSON.stringify({ estimatedBand: 7.5, fluencyScore: 8.0, vocabularyScore: 8.0, grammarScore: 7.0 }),
    },
    {
      chatSessionId: createdChatSessions[3].id,
      role: 'USER',
      message: 'Summarize the architecture diagram shown in my screenshot.',
    },
    {
      chatSessionId: createdChatSessions[3].id,
      role: 'ASSISTANT',
      message: 'The diagram illustrates a Desktop App communicating with an Express Backend Gateway, utilizing WebSockets for live audio transcription and SQLite for storage.',
    },
    {
      chatSessionId: createdChatSessions[4].id,
      role: 'USER',
      message: 'Why is dividing by sqrt(d_k) important in scaled dot-product attention?',
    },
    {
      chatSessionId: createdChatSessions[4].id,
      role: 'ASSISTANT',
      message: 'For large values of vector dimension d_k, dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Scaling by sqrt(d_k) counteracts this effect.',
    },
    {
      chatSessionId: createdChatSessions[5].id,
      role: 'USER',
      message: 'How can I apply Habit Stacking to my daily English study routine?',
    },
    {
      chatSessionId: createdChatSessions[5].id,
      role: 'ASSISTANT',
      message: 'Pick an existing daily anchor habit like "After I pour my morning coffee" and stack your study target: "I will review 10 Anki flashcards".',
    },
    {
      chatSessionId: createdChatSessions[6].id,
      role: 'USER',
      message: 'What is the difference between "Ubiquitous" and "Pervasive"?',
    },
    {
      chatSessionId: createdChatSessions[6].id,
      role: 'ASSISTANT',
      message: 'While both mean widely present, "ubiquitous" often carries a neutral/positive connotation of being everywhere (e.g. ubiquitous smartphones), while "pervasive" can imply spreading throughout unwantedly (e.g. pervasive smell/corruption).',
    },
    {
      chatSessionId: createdChatSessions[7].id,
      role: 'USER',
      message: 'Does process.nextTick run before Promise.then in Node.js?',
    },
    {
      chatSessionId: createdChatSessions[7].id,
      role: 'ASSISTANT',
      message: 'Yes! process.nextTick microtasks are executed before other microtasks like resolved Promises within the same tick.',
    },
    {
      chatSessionId: createdChatSessions[8].id,
      role: 'USER',
      message: 'How do self-referential relations work in Prisma for Subject hierarchies?',
    },
    {
      chatSessionId: createdChatSessions[8].id,
      role: 'ASSISTANT',
      message: 'You define a relation name (e.g. "SubjectToSubject") pointing `parentId` to `id` on the same `Subject` model.',
    },
    {
      chatSessionId: createdChatSessions[9].id,
      role: 'USER',
      message: 'How to paraphrase "urbanization has profoundly reshaped demographic landscapes"?',
    },
    {
      chatSessionId: createdChatSessions[9].id,
      role: 'ASSISTANT',
      message: 'Option 1: "The expansion of cities has dramatically transformed population distributions." Option 2: "Urban growth has exerted a transformative impact on demographic patterns."',
    },
  ];

  const createdChatMessages = await Promise.all(
    chatMessagesData.map((m) => prisma.aiChatHistory.create({ data: m }))
  );
  console.log(`✅ Created ${createdChatMessages.length} AiChatHistory messages.`);

  // -------------------------------------------------------------
  // 13. Schedules (10 items)
  // -------------------------------------------------------------
  const schedulesData = [
    {
      title: 'Morning IELTS Speaking Practice',
      description: 'Practice 2 cue cards and record audio for pronunciation analysis.',
      startTime: new Date(now.getTime() + 3600 * 1000 * 2),
      endTime: new Date(now.getTime() + 3600 * 1000 * 3),
      isCompleted: false,
    },
    {
      title: 'Deep Reading: System Architecture Chapter 4',
      description: 'Read and highlight key sections on Replication and Consensus.',
      startTime: new Date(now.getTime() + 3600 * 1000 * 5),
      endTime: new Date(now.getTime() + 3600 * 1000 * 7),
      isCompleted: false,
    },
    {
      title: 'Anki Review Session',
      description: 'Review pending flashcards in IELTS and System Architecture decks.',
      startTime: new Date(now.getTime() + 3600 * 1000 * 9),
      endTime: new Date(now.getTime() + 3600 * 1000 * 10),
      isCompleted: true,
    },
    {
      title: 'Backend API Refactoring',
      description: 'Implement global error handling middleware and validation schemas.',
      startTime: new Date(now.getTime() + 24 * 3600 * 1000 * 1),
      endTime: new Date(now.getTime() + 24 * 3600 * 1000 * 1 + 3600 * 1000 * 3),
      isCompleted: false,
    },
    {
      title: 'Shadowing Drill: Tech Presentation',
      description: 'Practice shadowing 15 minutes of tech talk video.',
      startTime: new Date(now.getTime() + 24 * 3600 * 1000 * 1 + 3600 * 1000 * 4),
      endTime: new Date(now.getTime() + 24 * 3600 * 1000 * 1 + 3600 * 1000 * 5),
      isCompleted: false,
    },
    {
      title: 'Weekly Knowledge Graph Audit',
      description: 'Review concept relations in Second Brain graph view.',
      startTime: new Date(now.getTime() + 24 * 3600 * 1000 * 2),
      endTime: new Date(now.getTime() + 24 * 3600 * 1000 * 2 + 3600 * 1000 * 1),
      isCompleted: false,
    },
    {
      title: 'IELTS Writing Essay Task 2 Draft',
      description: 'Write 250-word essay on Technology and Society.',
      startTime: new Date(now.getTime() + 24 * 3600 * 1000 * 3),
      endTime: new Date(now.getTime() + 24 * 3600 * 1000 * 3 + 3600 * 1000 * 1.5),
      isCompleted: false,
    },
    {
      title: 'Whisper WebSocket Socket Test',
      description: 'Test local realtime audio streaming transcription stability.',
      startTime: new Date(now.getTime() + 24 * 3600 * 1000 * 4),
      endTime: new Date(now.getTime() + 24 * 3600 * 1000 * 4 + 3600 * 1000 * 2),
      isCompleted: true,
    },
    {
      title: 'Book Summary Writing: Atomic Habits',
      description: 'Finalize summary notes and export to Obsidian vault.',
      startTime: new Date(now.getTime() + 24 * 3600 * 1000 * 5),
      endTime: new Date(now.getTime() + 24 * 3600 * 1000 * 5 + 3600 * 1000 * 1),
      isCompleted: false,
    },
    {
      title: 'Weekly Productivity Review',
      description: 'Evaluate study hours, habit streak, and deck completion rate.',
      startTime: new Date(now.getTime() + 24 * 3600 * 1000 * 6),
      endTime: new Date(now.getTime() + 24 * 3600 * 1000 * 6 + 3600 * 1000 * 1),
      isCompleted: false,
    },
  ];

  const createdSchedules = await Promise.all(
    schedulesData.map((s) => prisma.schedule.create({ data: s }))
  );
  console.log(`✅ Created ${createdSchedules.length} Schedules.`);

  // -------------------------------------------------------------
  // 14. Todos (12 items - with parent-child links and schedule links)
  // -------------------------------------------------------------
  const parentTodosData = [
    {
      title: 'Complete IELTS Preparation Sprint 1',
      description: 'Finish Speaking cards and 1 writing essay',
      isCompleted: false,
      scheduleId: createdSchedules[0].id,
    },
    {
      title: 'Master System Architecture Concepts',
      description: 'Complete DDIA chapter 3 & 4 summaries',
      isCompleted: false,
      scheduleId: createdSchedules[1].id,
    },
    {
      title: 'Optimize LingoAnki Backend Code',
      description: 'Refactor routes, schema seed, and WebSocket connections',
      isCompleted: true,
      scheduleId: createdSchedules[3].id,
    },
    {
      title: 'Maintain Daily Anki Habit',
      description: 'Clear due cards every morning without fail',
      isCompleted: true,
      scheduleId: createdSchedules[2].id,
    },
    {
      title: 'Setup Obsidian Sync Workflow',
      description: 'Configure local vault path and markdown exporter',
      isCompleted: false,
      scheduleId: createdSchedules[8].id,
    },
    {
      title: 'Practice Speaking Intonation',
      description: 'Record 3 shadowing sessions',
      isCompleted: false,
      scheduleId: createdSchedules[4].id,
    },
  ];

  const createdParentTodos = await Promise.all(
    parentTodosData.map((t) => prisma.todo.create({ data: t }))
  );
  const todoMap = new Map(createdParentTodos.map((t) => [t.title, t]));

  const childTodosData = [
    {
      title: 'Record Cue Card on Memorable Trip',
      description: 'Sub-task of IELTS Prep',
      isCompleted: true,
      parentId: todoMap.get('Complete IELTS Preparation Sprint 1')?.id,
    },
    {
      title: 'Review Vocabulary Extraction Feedback',
      description: 'Sub-task of IELTS Prep',
      isCompleted: false,
      parentId: todoMap.get('Complete IELTS Preparation Sprint 1')?.id,
    },
    {
      title: 'Create SSTable vs B-Tree Diagram',
      description: 'Sub-task of System Architecture',
      isCompleted: true,
      parentId: todoMap.get('Master System Architecture Concepts')?.id,
    },
    {
      title: 'Write Prisma Seed Script with Mock Data',
      description: 'Sub-task of Backend Optimization',
      isCompleted: true,
      parentId: todoMap.get('Optimize LingoAnki Backend Code')?.id,
    },
    {
      title: 'Test SQLite Cascade Delete Rules',
      description: 'Sub-task of Backend Optimization',
      isCompleted: true,
      parentId: todoMap.get('Optimize LingoAnki Backend Code')?.id,
    },
    {
      title: 'Export 10 Terms to Obsidian Format',
      description: 'Sub-task of Obsidian Sync',
      isCompleted: false,
      parentId: todoMap.get('Setup Obsidian Sync Workflow')?.id,
    },
  ];

  const createdChildTodos = await Promise.all(
    childTodosData.map((t) => prisma.todo.create({ data: t }))
  );
  console.log(`✅ Created ${createdParentTodos.length + createdChildTodos.length} Todos.`);

  // -------------------------------------------------------------
  // 15. Notifications (10 items)
  // -------------------------------------------------------------
  const allTodos = [...createdParentTodos, ...createdChildTodos];
  const notificationsData = [
    {
      todoId: allTodos[0].id,
      title: 'Reminder: IELTS Speaking Practice',
      body: 'Your scheduled session "Morning IELTS Speaking Practice" is starting in 15 minutes.',
      isRead: false,
      type: 'REMINDER',
    },
    {
      todoId: allTodos[1].id,
      title: 'Reading Task Due',
      body: 'Time to read Chapter 4 of Designing Data-Intensive Applications.',
      isRead: false,
      type: 'REMINDER',
    },
    {
      todoId: allTodos[2].id,
      title: 'Task Completed!',
      body: 'Great job completing "Optimize LingoAnki Backend Code".',
      isRead: true,
      type: 'UPDATE',
    },
    {
      todoId: allTodos[3].id,
      title: 'Anki Cards Due',
      body: 'You have 10 flashcards waiting for review in IELTS Core Vocabulary.',
      isRead: false,
      type: 'REMINDER',
    },
    {
      todoId: allTodos[6].id,
      title: 'Audio Transcription Ready',
      body: 'Your speaking recording audio_20260901_103000.wav has been processed by Whisper AI.',
      isRead: true,
      type: 'SYSTEM',
    },
    {
      todoId: allTodos[9].id,
      title: 'Prisma Seed Complete',
      body: 'Database seed was successfully executed with 10+ relational items per table.',
      isRead: true,
      type: 'SYSTEM',
    },
    {
      title: 'Obsidian Vault Connection Warning',
      body: 'Auto-sync is disabled. Please verify Obsidian vault path in settings.',
      isRead: false,
      type: 'SYSTEM',
    },
    {
      title: 'AnkiConnect Sync Success',
      body: 'Successfully pushed 8 new flashcards to local Anki Desktop app.',
      isRead: true,
      type: 'UPDATE',
    },
    {
      title: 'New Feature Available',
      body: 'Second Brain Graph view now supports interactive concept relationship filtering.',
      isRead: false,
      type: 'UPDATE',
    },
    {
      title: 'Daily Streak Milestone!',
      body: 'Congratulations! You have maintained a 7-day study streak.',
      isRead: true,
      type: 'SYSTEM',
    },
  ];

  const createdNotifications = await Promise.all(
    notificationsData.map((n) => prisma.notification.create({ data: n }))
  );
  console.log(`✅ Created ${createdNotifications.length} Notifications.`);

  console.log('🎉 Seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
