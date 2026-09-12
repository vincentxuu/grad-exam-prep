# 資管所資訊科技概論 113 年第 23–25 題核對

核對日期：2026-08-16（Asia/Taipei）  
範圍：唯讀核對題目、qfiles、原始 PDF、圖片對應、答案資料格式；未修改產品檔案。

## 結論

| 題號 | 題型 | 正確答案 | 判定 |
|---|---|---|---|
| `q-pp-im-it-113-23` | 單選 | **E** | GPT 是 **Generative Pre-trained Transformer**；A–D 均未列出正名，所以選 none of the above。 |
| `q-pp-im-it-113-24` | 單選 | **D** | 描述的是用行為／互動評估機器是否呈現人類智慧的 **Turing test**。 |
| `q-pp-im-it-113-25` | 申論／程式實作 | **N/A** | 沒有選項答案；需提供 BST 插入、中序走訪與列印的完整參考解法。 |

## 本地原始資料核對

- 原始試卷：`public/papers/pp-im-it-113.pdf`，4 頁，SHA-256 `05b3948e371e217913a4b56ccc273a25413367522771784679af8eecc23a0b53`。
- PDF 第 3 頁包含第 23、24 題及第 25 題類別宣告前半；第 4 頁包含第 25 題方法宣告與 (a)、(b) 完整要求。
- 題目彙總：`public/data/questions.json` 的三題文字與 PDF 一致，三題皆標為 `hasImage: false`。
- 單題資料：
  - `public/data/qfiles/q-pp-im-it-113-23.json`，SHA-256 `90802cbcc56c2b93012046b7951c40d459164dc3432386728c7dde445d454479`
  - `public/data/qfiles/q-pp-im-it-113-24.json`，SHA-256 `4f5df86d34278c26db06865732f30e0961febff53ee371aa35330d29b6a03c41`
  - `public/data/qfiles/q-pp-im-it-113-25.json`，SHA-256 `341ba3cbe7a1cd3938c16bb4b6ada80d73339a4d1e8d28184b97a6d7b83c52cf`
- `public/data/question-images.json` 與 `public/data/paper-images.json` 沒有這三題／此試卷的獨立圖片映射；判題應以原始 PDF 第 3–4 頁為視覺權威。
- `HEAD`（`4a76afb`）的 `public/data/answers.json` 原本三題皆為 `null`。核對期間工作樹已由另一工作流程新增 E、D、N/A 三筆；其答案內容與本報告結論一致。

## 答案格式

倉庫既有規則記錄於 `scripts/write-missing-answers.js`：單選用單一字母、複選用連續字母、申論題用 `N/A`、計算題用最終數值。因此建議資料形狀如下：

```json
{
  "q-pp-im-it-113-23": { "questionId": "q-pp-im-it-113-23", "answer": "E", "explanation": "..." },
  "q-pp-im-it-113-24": { "questionId": "q-pp-im-it-113-24", "answer": "D", "explanation": "..." },
  "q-pp-im-it-113-25": { "questionId": "q-pp-im-it-113-25", "answer": "N/A", "explanation": "..." }
}
```

## 第 25 題完整 C++ 參考解法

以下只依題目已公開的 private 欄位撰寫；`BinarySearchTree` 是 `TreeNode` 的 friend，因此可設定節點欄位。題目明定 ID 不重複；`std::nothrow` 讓配置失敗時能依介面回傳 0。

```cpp
int BinarySearchTree::InsertNewEmployee(
    int newID, string newName, int newAge) {
  TreeNode *node = new (std::nothrow) TreeNode;
  if (node == NULL) return 0;

  node->employeeID = newID;
  node->employeeName = newName;
  node->age = newAge;
  node->leftChildPtr = NULL;
  node->rightChildPtr = NULL;

  if (rootPtr == NULL) {
    rootPtr = node;
    return 1;
  }

  TreeNode *parent = NULL;
  TreeNode *current = rootPtr;
  while (current != NULL) {
    parent = current;
    if (newID < current->employeeID)
      current = current->leftChildPtr;
    else
      current = current->rightChildPtr;
  }

  if (newID < parent->employeeID)
    parent->leftChildPtr = node;
  else
    parent->rightChildPtr = node;

  return 1;
}

void BinarySearchTree::ListAllEmployee() {
  inorder(rootPtr);
}

void BinarySearchTree::inorder(TreeNode *treePtr) {
  if (treePtr == NULL) return;

  inorder(treePtr->leftChildPtr);
  cout << "(" << treePtr->employeeID << ", "
       << treePtr->employeeName << ", "
       << treePtr->age << ")" << endl;
  inorder(treePtr->rightChildPtr);
}
```

### 解法要點與複雜度

1. 新節點左右子指標必須初始化為 `NULL`。
2. 空樹時直接令 `rootPtr = node`。
3. 非空樹由根開始，依 `newID < employeeID` 往左，否則往右，保留 `parent`，走到空子指標後接上新節點。
4. `ListAllEmployee()` 從 `rootPtr` 啟動遞迴中序走訪。
5. 中序順序是 left → node → right，因此 BST 的輸出按 employeeID 遞增。
6. 插入時間 `O(h)`、額外空間 `O(1)`；未平衡時最壞 `h=n`。走訪時間 `O(n)`、遞迴堆疊 `O(h)`。

### 編譯與行為驗證

將等價完整類別模型保存為 `.work/verify-im-it-113-q25.cpp`，以：

```sh
c++ -std=c++17 -Wall -Wextra -pedantic \
  .work/verify-im-it-113-q25.cpp -o .work/verify-im-it-113-q25
.work/verify-im-it-113-q25
```

實測插入 ID `50, 20, 70, 10, 30`，輸出 ID 為 `10, 20, 30, 50, 70`，且編譯器沒有警告，驗證中序輸出確實遞增。

## 外部可驗證來源

- OpenAI 2018 原始 GPT 研究介紹：[Improving language understanding with unsupervised learning](https://openai.com/index/language-unsupervised/)；頁面明載方法結合 Transformer 與 unsupervised pre-training，並以 generative pre-training 描述方法，支持 GPT 正名與第 23 題選 E。
- Stanford Encyclopedia of Philosophy：[The Turing Test](https://plato.stanford.edu/entries/turing-test/)；條目明確指出 Turing Test 源自 Turing (1950)，以 Imitation Game 處理機器能否思考／呈現智慧的問題，支持第 24 題選 D。
- 原始文獻書目：Alan Turing, “Computing Machinery and Intelligence,” *Mind* 59(236), 1950, pp. 433–460；Stanford 條目提供完整書目與內容摘要。

## 注意事項

- 第 25 題現有工作樹解答使用未限定名稱 `nothrow`；若上下文未保證 `using namespace std;`，產品答案應改成 **`std::nothrow`**，並確保引入 `<new>`，避免參考程式無法獨立編譯。
- 題目已明定 employeeID 不重複，所以參考解法不需要重複鍵分支。若日後解除此前提，必須在配置節點前或走訪時檢查相等鍵，並避免記憶體洩漏。
