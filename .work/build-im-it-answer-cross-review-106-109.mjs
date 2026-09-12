import fs from 'node:fs';

const first = JSON.parse(fs.readFileSync('.work/im-it-answer-review-106-109.json', 'utf8'))
  .filter((item) => item.verdict !== 'confirmed');

const decisions = {
  'q-pp-im-it-106-5': ['confirm_current', 'C', '1NF 的正式要求是每個欄位值原子化且不得有 repeating groups；primary key 並非 1NF 本身的必要條件，所以 C 的整句錯誤，現行 C 可確認。'],
  'q-pp-im-it-106-8': ['confirm_current', 'E', 'Volume、velocity、variety 與 value 都是常見 Big Data V-characteristics；A 至 D 均可成立，因此應選 E。'],
  'q-pp-im-it-106-12': ['agree_disputed', 'A/C', 'A 是 LFU、C 近似 LRU；兩者表現取決於 workload，沒有一種 cache replacement policy 在一般情況必然優於其他策略，題幹不足以給唯一答案。'],
  'q-pp-im-it-106-19': ['agree_disputed', 'C/D', 'TCP/UDP port 的有效範圍為 0–65535，因此 C 錯；well-known ports 為 0–1023，而非 0–2048，因此 D 也錯，至少兩個答案。'],
  'q-pp-im-it-107-11': ['alternative_correction', 'E', 'certificate serial number 可作為 CRL/OCSP revocation tracking 的識別值；issuer、subject public key 與 X.509 敘述也正確，因此 A 至 D 均正確，應選 E。'],
  'q-pp-im-it-107-19': ['agree_disputed', 'B/C', 'C 明確有問題：Bitcoin transactions 是公開且 pseudonymous，不是全部匿名並加密。B 也把 Bitcoin 的 replicated ledger 說成 blocks 可分散保存而無 peer 維護完整鏈；雖 SPV/pruned nodes 不保留全量資料，這仍不是 Bitcoin full-node ledger 的標準描述，因此 B/C 無法形成唯一答案。'],
  'q-pp-im-it-108-16': ['agree_disputed', 'D/E', 'deep learning 可採 supervised、unsupervised 或 self-supervised training，D 不是普遍必要條件；但 D 使用「usually」而非「always」，在大量監督式應用中仍可成立，故 D 與全對的 E 取決於題目預設，無唯一答案。'],
  'q-pp-im-it-108-17': ['agree_disputed', 'C/E', 'virus 能複製與散播並非全錯，但「actively replicate themselves and spread to other computers」更精確描述 worm；題目未交代是否以自動跨主機散播區分 virus/worm，因此 C 與 E 存在定義歧義。'],
  'q-pp-im-it-109-2': ['agree_corrected', 'C', 'protected 允許目前 class、subclasses，且部分語言也允許 same-package access，與題幹完全對應。'],
  'q-pp-im-it-109-3': ['agree_corrected', 'E', 'Python 支援 functional、object-oriented、procedural 與 imperative styles，A 至 D 均正確，因此選 E。'],
  'q-pp-im-it-109-4': ['agree_corrected', 'B', 'Python 是 dynamically typed，不是 statically typed；其餘敘述描述一般 Python 特性。'],
  'q-pp-im-it-109-5': ['agree_corrected', 'A', '由 vendor 在 cloud 管理並依需求透過 Internet 提供的軟體，選項中對應 on-demand software。'],
  'q-pp-im-it-109-6': ['agree_corrected', 'D', 'Google App Engine 提供受管 application runtime/platform，分類為 Platform-as-a-Service。'],
  'q-pp-im-it-109-9': ['agree_corrected', 'B', '代替 client 向 origin server 請求資源的 intermediary server 是 proxy。'],
  'q-pp-im-it-109-11': ['agree_corrected', 'B', 'IPv6 address space 是 128 bits，不是 120 bits，因此 B 錯。'],
  'q-pp-im-it-109-15': ['agree_corrected', 'B', 'DDR4 DRAM 是 volatile memory；SSD、ROM 與 flash 都可在斷電後保留資料。'],
  'q-pp-im-it-109-17': ['agree_corrected', 'A', 'CIA triad 的標準展開為 Confidentiality、Integrity、Availability。'],
  'q-pp-im-it-109-18': ['agree_corrected', 'A', '標準 SQL 建表語法是 CREATE TABLE，欄位定義置於括號中，只有 A 合法。'],
  'q-pp-im-it-109-20': ['agree_corrected', 'D', '2020 年全球 connected/IoT devices 的常見估計約為百億量級，落在 10–50 billion。'],
};

const output = first.map((item) => {
  const decision = decisions[item.questionId];
  if (!decision) throw new Error(`missing decision for ${item.questionId}`);
  const [secondVerdict, secondReviewedAnswer, reasoning] = decision;
  return {
    questionId: item.questionId,
    firstVerdict: item.verdict,
    firstReviewedAnswer: item.reviewedAnswer,
    secondVerdict,
    secondReviewedAnswer,
    reasoning,
    sourceBasis: [
      `public/papers/${item.questionId.replace(/^q-/, '').replace(/-\d+$/, '')}.pdf 原卷題目與選項`,
      '獨立逐項技術推導；未採用第一輪 reasoning',
      '無官方答案 key',
    ],
    consensus: secondVerdict === 'agree_corrected' || secondVerdict === 'agree_disputed',
  };
});

fs.writeFileSync('.work/im-it-answer-cross-review-106-109.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(`wrote ${output.length} cross reviews`);
