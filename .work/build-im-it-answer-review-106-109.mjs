import fs from 'node:fs';

const years = {
  106: {
    answers: ['D','B','A','E','C/E','C','C','D/E','B','C','C','A/C','A','B','C','C','B','E','C/D','E','C','C','A','D'],
    facts: [
      'D separates student, enrollment/grade, instructor, and classroom facts while retaining stable identifiers and minimizing redundancy.',
      'Because each course already identifies the course, Student_ID and Grade are the minimal nonredundant fields.',
      'A is the only syntactically valid SELECT with the required country condition and grouped city disjunction.',
      'A-D are standard relational-model statements, so the sentinel answer E applies.',
      'Whether primary-key identification is treated as part of 1NF or as a separate relational-model requirement varies by definition; C and E cannot be separated reliably.',
      'Fintech is the standard term for technology-enabled financial-service applications, processes, products, and business models.',
      'AlphaGo centrally used deep neural networks together with tree search; C is the unique matching technique.',
      'Big-data V frameworks differ: many include value, while the classic 3V formulation does not; the wording “widely regarded” does not uniquely separate D from E.',
      'Streaming is precisely continuous receipt and presentation while media is being delivered.',
      'Digital divide is the established term for socioeconomic inequality in ICT access, use, and effects.',
      'The even-parity word has an even number of ones, but parity cannot rule out an even number of bit errors; C overclaims certainty.',
      'No workload-independent ordering makes LRU universally better than LFU; “in general” leaves A versus C dependent on the reference model and workload.',
      'BIOS is firmware that initializes hardware during boot.',
      'Paging divides virtual address space into pages that are moved between memory and backing storage.',
      'RAID targets capacity, performance, and/or fault tolerance, not confidentiality or access-control security.',
      'Kickstarter is a crowdfunding platform.',
      'Udacity, Coursera, and edX are commonly described as MOOC platforms.',
      'Under the conventional shared-Ethernet model used by the options, A-D are accepted descriptions and E is the intended sentinel.',
      'Ports are 16-bit values 0-65535, making C false; well-known ports are 0-1023, making D false as written, so the item has two wrong choices.',
      'OSI layer 3/network, layer 5/session, SMTP/layer 7, and TCP/layer 4 are all correct.',
      'Inheritance, not polymorphism, is the primary mechanism named for implementation reuse in this introductory framing.',
      'Commercial proprietary Unix systems exist, so the entire Unix family is not open source.',
      'A describes a Gantt chart rather than a UML class diagram.',
      'Taiwan ETC uses dedicated short-range communication rather than LTE vehicle tracking.'
    ]
  },
  107: {
    answers: ['B','A','C','C','C','B','B','E','A','D','A/E','E','C','E','B','E','C','E','B/C','E','C','B','D','D'],
    facts: [
      'The original voice-only smart-speaker products use speech recognition, NLP, synthesis, and device control, not image recognition.',
      'Relational databases, not object-oriented databases, are the most widely used database model.',
      'A primary key identifies rows, not columns.',
      'COUNT(DISTINCT country) uniquely counts distinct countries.',
      'COUNT(id) with GROUP BY country computes customers per country.',
      'Multidimensional databases are optimized for data warehousing and OLAP cube queries.',
      'Reading data written by an uncommitted transaction is a dirty read.',
      'All four OSI statements are standard layer assignments, so E applies.',
      'Despite the PDF typo “Kerkeros,” the ticket-based authentication protocol described is Kerberos, option A.',
      'HTTPS/TLS addresses authentication, confidentiality, integrity, and MITM resistance; fault tolerance is outside its security goals.',
      'A certificate serial number uniquely identifies a certificate and is referenced by CRLs/OCSP workflows; whether that counts as “used to track revocation information” is wording-dependent, leaving A versus E unresolved.',
      'Password-fatigue reduction and Facebook/Google federated login are all valid SSO examples in the item’s framing.',
      'A VPN makes communication over a shared/public network behave as access to a private network.',
      'MS-DOS is an operating system; HFS, NTFS, exFAT, and ext3 are file systems.',
      'A device driver is hardware-dependent and OS-specific software mediating transparent device access.',
      'The listed introductory CISC/RISC characterizations and x86/ARM examples are all accepted, so E applies.',
      'Creating virtual versions of compute, storage, and network resources is virtualization, option C in the verified PDF.',
      'A-D are standard high-level Bitcoin properties in the item’s historical framing, so E applies.',
      'B incorrectly describes Bitcoin as distributing partial block lists such that no peer needs the full chain, while C also incorrectly calls public pseudonymous transaction data anonymous and encrypted; the single-choice item has two defensible errors.',
      'CIA expands to Confidentiality, Integrity, Availability; only E correctly identifies Availability.',
      'RSA is asymmetric; DES, IDEA, Caesar, and AES are symmetric mechanisms.',
      'Large populations of weak IoT devices make botnet-driven DDoS especially difficult to defend.',
      'ISO/IEC 27001 specifies requirements for an ISMS.',
      'ACID ends in Durability; the other expansions are wrong.'
    ]
  },
  108: {
    answers: ['B','B','D','A','E','E','C','D','D','E','E','A','C','A','E','D/E','C/E','D','D','E'],
    facts: [
      'JPEG, GIF, and BMP are image formats; MPEG is principally a moving-image/audio coding family.',
      'A browser cookie is website-supplied local state data.',
      'A 128-bit IPv6 address space contains 2^128 possible bit patterns.',
      'TCP/IP is the foundational Internet protocol suite among the choices.',
      'CPU scheduling, storage, memory, and I/O management are all operating-system tasks, so E applies.',
      'Linux is open source and Unix-like; Android uses the Linux kernel and AOSP is open source, so E applies.',
      'RFID is the dedicated identification/tracking technology among these options.',
      'GPS provides localization rather than direct perception of surrounding objects; lidar, radar, and vision do the latter.',
      'The regulation described is the EU General Data Protection Regulation.',
      'Volume, velocity, variety, and veracity are all established big-data attributes in the 4V formulation.',
      'All four listed domains can apply big-data analysis, so E applies.',
      'CAPTCHA explicitly expands to a public Turing test distinguishing computers and humans.',
      'LDAP is the lightweight directory-access protocol derived from the X.500 directory model.',
      'SSH was designed as the secure replacement for Telnet, rlogin, and rsh.',
      '“Deep” refers to network depth/layer count, which none of A-D names.',
      'Human labeling is common in supervised deep learning but not required in self-supervised or unsupervised learning; “usually” makes D versus E dependent on scope and era.',
      'Viruses replicate by infecting hosts and can spread, while autonomous network propagation is the sharper worm distinction; the word “actively” does not uniquely force C rather than E.',
      'Psychological manipulation of people is the definition of social engineering.',
      'A firewall filters incoming and outgoing traffic according to security rules.',
      'Network printing, RPC, email protocols, and HTTP all have standard client-server deployments, so E applies.'
    ]
  },
  109: {
    answers: ['B','C','E','B','A','D','E','D','B','E','B','A','C','A','B','D','A','A','D','D'],
    facts: [
      'Hiding internal state behind object methods is encapsulation.',
      'Protected, not private, grants access to the defining class and subclasses (and package peers in Java).',
      'Python supports functional, object-oriented, procedural, and imperative styles, so E is the only “none wrong” answer.',
      'Python is dynamically typed, making B false; it is general-purpose, interpreted, and indentation-delimited.',
      'The model described is software delivered on demand over a vendor-managed cloud; among the provided options, A is the direct match.',
      'Google App Engine is a canonical platform-as-a-service offering.',
      'LINE Pay, Pi wallet, JKo/街口, and Taiwan Pay are payment services; 嘖嘖 is crowdfunding.',
      'The expected peak-rate range for 5G in these choices is 1-10 Gbps.',
      'A server intermediating client requests to origin servers is a proxy.',
      'DNS performs name-to-address resolution, and no DNS server is listed, so E applies.',
      'IPv6 uses 128-bit, not 120-bit, addresses; B is the uniquely wrong statement.',
      'Ethernet is the dominant LAN technology among the listed choices.',
      'A parity bit makes the total number of one bits even or odd.',
      'Bluetooth is not the usual high-bandwidth phone-to-VR-headset link; the other pairings are common Bluetooth uses.',
      'DDR4 RAM is volatile; SSD, ROM, and flash retain data without power.',
      'ISO 27001 is the ISMS specification among the choices.',
      'The information-security CIA triad is Confidentiality, Integrity, and Availability.',
      'CREATE TABLE Customers (...) is the valid SQL table-creation statement.',
      'MariaDB was community-developed as a MySQL-compatible open-source fork after Oracle’s acquisition.',
      'Contemporary estimates commonly placed 2020 connected devices in the tens of billions, matching 10-50 billion.'
    ]
  }
};

const questions = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8')).questions;
const answerData = JSON.parse(fs.readFileSync('public/data/answers.json', 'utf8')).answers;
const metadata = JSON.parse(fs.readFileSync('public/data/im-it-question-metadata.json', 'utf8')).questions;
const records = [];

for (const [yearText, spec] of Object.entries(years)) {
  const year = Number(yearText);
  const expected = metadata.filter((m) => m.paperId === `pp-im-it-${year}` && m.questionType === 'single_choice');
  if (expected.length !== spec.answers.length || spec.answers.length !== spec.facts.length) {
    throw new Error(`${year}: expected ${expected.length}, answers ${spec.answers.length}, facts ${spec.facts.length}`);
  }
  for (const meta of expected) {
    const q = questions.find((entry) => entry.id === meta.questionId);
    const current = answerData[meta.questionId]?.answer;
    if (!q || !current) throw new Error(`missing source for ${meta.questionId}`);
    const index = q.number - 1;
    const reviewed = spec.answers[index];
    const disputed = reviewed.includes('/');
    const corrected = !disputed && reviewed !== current;
    records.push({
      questionId: meta.questionId,
      currentAnswer: current,
      reviewedAnswer: reviewed,
      verdict: disputed ? 'disputed' : corrected ? 'corrected' : 'confirmed',
      confidence: disputed ? 'disputed' : 'medium',
      reasoning: spec.facts[index],
      sourceBasis: [
        `public/papers/pp-im-it-${year}.pdf (original question face; no official answer key)`,
        '.work/im-it-pdf-audit-106-110.md (visual question-text parity audit)',
        ...(year === 107 ? ['.work/im-it-107-repair-report.md (PDF repair evidence)'] : []),
        ...(year === 109 ? ['.work/im-it-109-110-113-replacements-report.md (PDF repair evidence)'] : []),
        'Independent technical derivation from the verified stem and choices; answers.json explanation used only as a cross-check'
      ],
      autoGradeEligible: !disputed
    });
  }
}

const expectedIds = metadata
  .filter((m) => [106, 107, 108, 109].includes(Number(m.paperId.slice(-3))) && m.questionType === 'single_choice')
  .map((m) => m.questionId)
  .sort();
const actualIds = records.map((row) => row.questionId).sort();
if (new Set(actualIds).size !== records.length) throw new Error('duplicate review rows');
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) throw new Error('review coverage differs from metadata single_choice scope');
for (const row of records) {
  if (!['confirmed', 'corrected', 'disputed', 'insufficient'].includes(row.verdict)) throw new Error(`invalid verdict: ${row.questionId}`);
  if (!['medium', 'low', 'disputed'].includes(row.confidence)) throw new Error(`invalid confidence: ${row.questionId}`);
  if (row.autoGradeEligible !== (row.verdict === 'confirmed' || row.verdict === 'corrected')) throw new Error(`invalid eligibility: ${row.questionId}`);
}

fs.writeFileSync('.work/im-it-answer-review-106-109.json', `${JSON.stringify(records, null, 2)}\n`);
const counts = records.reduce((acc, row) => ({ ...acc, [row.verdict]: (acc[row.verdict] ?? 0) + 1 }), {});
const byYear = Object.fromEntries([106, 107, 108, 109].map((year) => {
  const rows = records.filter((row) => row.questionId.includes(`-${year}-`));
  return [year, rows.reduce((acc, row) => ({ ...acc, total: acc.total + 1, [row.verdict]: (acc[row.verdict] ?? 0) + 1 }), { total: 0 })];
}));
console.log(JSON.stringify({ total: records.length, unique: new Set(actualIds).size, counts, autoGradeEligible: records.filter((row) => row.autoGradeEligible).length, byYear }, null, 2));
