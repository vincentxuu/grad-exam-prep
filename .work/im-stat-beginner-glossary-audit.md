# IM-STAT 零基礎專有名詞稽核

## 稽核結論

- 六堂課目前已使用生活情境，但正文很快跳到英文縮寫、希臘字母與公式；零基礎讀者容易知道故事，卻不知道符號怎麼念、每個量在做什麼。
- 最需要補的是「首次出現即解釋」：先給繁中名稱與一句話，再顯示英文／符號，且同一符號在不同課的角色要明講（例如 α 可是顯著水準，也可是權重參數）。
- 建議每堂正文只主動引入下列 5 個核心詞；較進階名詞留在可展開詞彙卡，避免一段同時出現多個未定義詞。
- 本表是教學可讀性稽核，不改動統計結論或題目答案；詞彙資料的機器可讀版本在 .work/im-stat-beginner-glossary-fragment.json。

## 核心詞彙（每堂 5 詞）

## 1. 先備：把平均與波動拆開看

### 1. 期望值

- Preferred label：期望值
- Aliases／符號：expected value、expectation、E(X)、μ、mu
- 白話定義：期望值是把每個可能結果乘上其機率後加總的長期平均；E(X) 讀作「X 的期望值」，μ 讀作「mu／繆」，常用來代表母體平均。
- 生活例子：一張彩券有不同獎金與中獎機率，把每種獎金乘上機率再相加，就是每買一張長期平均可拿回的金額。
- 容易誤解：期望值不一定是實際可能出現的結果，也不是只做一次就一定會拿到的數字。
- 適用 lesson IDs：lesson-im-stat-prereq-expectation-variance

### 2. 變異數

- Preferred label：變異數
- Aliases／符號：variance、Var(X)、σ²、sigma squared
- 白話定義：變異數把每個值離平均的距離平方後取平均，用來表示資料有多分散；Var(X) 讀作「X 的變異數」，σ² 讀作「sigma 平方」。
- 生活例子：兩班平均都考 70 分，但一班都在 65 至 75 分，另一班從 30 到 100 分，後一班的變異數較大。
- 容易誤解：變異數的單位會被平方，因此不能直接把它當成原資料的典型差距。
- 適用 lesson IDs：lesson-im-stat-prereq-expectation-variance

### 3. 標準差

- Preferred label：標準差
- Aliases／符號：standard deviation、SD、σ、sigma、sqrt(Var(X))
- 白話定義：標準差是變異數開根號後的分散程度；σ 讀作「sigma」，與原資料使用相同單位。
- 生活例子：體重的標準差若是 3 公斤，可以直覺理解成讀值通常在平均附近相差幾公斤。
- 容易誤解：標準差不是變異數本身，σ 與 σ² 分別代表標準差與變異數。
- 適用 lesson IDs：lesson-im-stat-prereq-expectation-variance

### 4. 共變異數

- Preferred label：共變異數
- Aliases／符號：covariance、Cov(X,Y)、cov
- 白話定義：共變異數描述兩個變數是否傾向一起高或一起低；Cov(X,Y) 讀作「X 與 Y 的共變異數」。
- 生活例子：天氣越熱時冷飲銷量通常越高，溫度與冷飲銷量會呈現正的共變異數。
- 容易誤解：共變異數為 0 不一定代表兩變數完全獨立，而且數值大小會受單位影響。
- 適用 lesson IDs：lesson-im-stat-prereq-expectation-variance

### 5. 獨立同分布

- Preferred label：獨立同分布
- Aliases／符號：iid、i.i.d.、independent and identically distributed
- 白話定義：獨立同分布表示每筆觀察彼此不影響，且都由同一套機率規則產生；iid 逐字母讀作「i-i-d」。
- 生活例子：每次都把公平硬幣重新拋一次，前一次結果不影響下一次，而且每次正面機率都相同。
- 容易誤解：只要分布相同不代表獨立，只要獨立也不代表每筆資料的分布相同。
- 適用 lesson IDs：lesson-im-stat-prereq-expectation-variance

## 2. 先備：假設檢定是一條決策流程

### 1. 虛無假設與對立假設

- Preferred label：虛無假設與對立假設
- Aliases／符號：null hypothesis、alternative hypothesis、H0、H₀、H1、H₁
- 白話定義：H₀ 讀作「H 零」，是檢定暫時保留的基準說法；H₁ 讀作「H 一」，是資料足夠反對 H₀ 時所支持的方向。
- 生活例子：煙霧警報器先以「沒有火災」為 H₀，只有感測訊號夠異常才改採「可能有火災」的 H₁。
- 容易誤解：未拒絕 H₀ 只代表證據不夠，不等於已經證明 H₀ 正確。
- 適用 lesson IDs：lesson-im-stat-prereq-hypothesis-workflow

### 2. 檢定統計量與參考分配

- Preferred label：檢定統計量與參考分配
- Aliases／符號：test statistic、reference distribution、sampling distribution
- 白話定義：檢定統計量把樣本證據濃縮成一個數字，參考分配則告訴我們在 H₀ 成立時這個數字通常會落在哪裡。
- 生活例子：警報器把溫度與煙霧濃度濃縮成警戒分數，再拿正常環境下的分數範圍作比較。
- 容易誤解：不同資料型態與假設條件要用不同統計量和分配，不能看到數字大就一律判為顯著。
- 適用 lesson IDs：lesson-im-stat-prereq-hypothesis-workflow

### 3. 顯著水準

- Preferred label：顯著水準
- Aliases／符號：significance level、α、alpha、α=0.05
- 白話定義：顯著水準 α 讀作「alpha」，是分析前設定的拒絕門檻，例如 α=0.05 表示願意承擔至多約 5% 的第一類錯誤風險。
- 生活例子：煙霧警報器把門檻調得越嚴格，越不容易誤報，但也可能更容易漏掉真正異常。
- 容易誤解：α 不是 H₀ 為真的機率，也不該看完 p 值後才為了得到想要的結論而更改。
- 適用 lesson IDs：lesson-im-stat-prereq-hypothesis-workflow

### 4. p 值

- Preferred label：p 值
- Aliases／符號：p-value、p value、p
- 白話定義：p 值是在 H₀ 成立的前提下，得到目前這麼極端或更極端資料的機率；p 讀作英文字母「p」。
- 生活例子：若正常廚房幾乎不會出現目前這麼高的煙霧讀值，p 值就會很小。
- 容易誤解：p 值不是 H₀ 為真的機率、不是結果由偶然造成的機率，也不表示效果大小。
- 適用 lesson IDs：lesson-im-stat-prereq-hypothesis-workflow

### 5. 統計顯著與未拒絕

- Preferred label：統計顯著與未拒絕
- Aliases／符號：statistical significance、reject H0、fail to reject H0、p<α
- 白話定義：當 p<α（讀作「p 小於 alpha」）時稱結果達統計顯著並拒絕 H₀，否則只能說未能拒絕 H₀。
- 生活例子：警報響起代表訊號越過預設門檻，但仍要由人確認是否真的起火及原因為何。
- 容易誤解：統計顯著不等於效果很大、實務上重要或已證明因果；未顯著也不等於兩者完全沒有差異。
- 適用 lesson IDs：lesson-im-stat-prereq-hypothesis-workflow

## 3. 把聯合機率表搬到新座標

### 1. 聯合機率質量函數

- Preferred label：聯合機率質量函數
- Aliases／符號：joint PMF、joint probability mass function、p(X=x,Y=y)
- 白話定義：聯合 PMF 列出兩個離散變數每一組可能配對的機率；PMF 逐字母讀作「P-M-F」，p(X=x,Y=y) 讀作「X 等於 x 且 Y 等於 y 的機率」。
- 生活例子：同時記錄擲兩顆骰子的點數，表格每一格就是某一對點數一起出現的機率。
- 容易誤解：聯合 PMF 用於可逐項列舉的離散結果；連續資料要談密度，單一點的機率通常為 0。
- 適用 lesson IDs：lesson-im-stat-pmf-transformations

### 2. 可能值集合

- Preferred label：可能值集合
- Aliases／符號：support、sample support、possible-value set
- 白話定義：support 是隨機變數真正可能取到且需要納入計算的所有值或座標集合。
- 生活例子：一顆六面骰子的 support 是 1 到 6，不包含 0 或 7。
- 容易誤解：support 不是目前樣本中剛好看見的值，而是模型允許出現的完整可能範圍。
- 適用 lesson IDs：lesson-im-stat-pmf-transformations

### 3. 正規化常數

- Preferred label：正規化常數
- Aliases／符號：normalizing constant、normalization constant、c、1/c
- 白話定義：正規化常數是把原始權重換成總和為 1 的機率所需的縮放數；c 讀作英文字母「c」，題目可能用除以 c 或乘上 c，須依公式判讀。
- 生活例子：籃子裡各色票共有 12 張，每色張數除以 12 後才是抽到該色的機率。
- 容易誤解：若權重總和為 12，以「權重/c」表示時 c=12，以「c×權重」表示時則 c=1/12，不能只背固定答案。
- 適用 lesson IDs：lesson-im-stat-pmf-transformations

### 4. 映射、像點與原像

- Preferred label：映射、像點與原像
- Aliases／符號：mapping、image、preimage、transformation、Y=g(X)
- 白話定義：映射是依規則把舊值換成新值，像點是換完後的位置，原像則是所有會被換到該位置的舊值；Y=g(X) 讀作「Y 等於 g 作用在 X」。
- 生活例子：把不同郵遞區號分到同一行政區時，行政區是像點，所有屬於它的郵遞區號是原像。
- 容易誤解：多個舊值可映到同一新值，此時新值的機率要把所有原像機率相加。
- 適用 lesson IDs：lesson-im-stat-pmf-transformations

### 5. 邊際機率質量函數

- Preferred label：邊際機率質量函數
- Aliases／符號：marginal PMF、marginal distribution、marginalization、Σy p(x,y)
- 白話定義：邊際 PMF 是只關心其中一個變數時，把另一個變數所有可能值的聯合機率加總；Σy p(x,y) 讀作「對所有 y，把 p(x,y) 加總」。
- 生活例子：表格同時記錄時段與商品，若只想知道各商品總銷量，就把每個商品跨所有時段的格子加起來。
- 容易誤解：加總時要固定想保留的變數並消去另一維，方向弄反會得到不同邊際分配。
- 適用 lesson IDs：lesson-im-stat-pmf-transformations

## 4. 多支有雜訊的溫度計怎麼加權

### 1. 觀察值與估計量

- Preferred label：觀察值與估計量
- Aliases／符號：observation、sample、estimator、Yi、Yᵢ、m
- 白話定義：Yᵢ 讀作「Y 下標 i」，表示第 i 筆有隨機性的觀察；估計量則是把多筆觀察依規則合成、用來猜未知母體數值的公式。
- 生活例子：每支溫度計讀值是觀察，把多支讀值平均後得到的數字是估計真實溫度的估計量。
- 容易誤解：估計量是抽樣前的計算規則，代入實際資料後得到的單一數字才叫估計值。
- 適用 lesson IDs：lesson-im-stat-unbiased-efficient-estimators

### 2. 不偏估計量

- Preferred label：不偏估計量
- Aliases／符號：unbiased estimator、unbiasedness、E(m)=μ
- 白話定義：若重複抽樣時估計量的長期平均等於真正參數，就稱不偏；E(m)=μ 讀作「m 的期望值等於 mu」。
- 生活例子：一支秤有時高估、有時低估，但長期平均恰好等於真實重量，可視為不偏。
- 容易誤解：不偏不代表每次都準，也不代表它比其他估計量波動更小。
- 適用 lesson IDs：lesson-im-stat-unbiased-efficient-estimators

### 3. 估計權重

- Preferred label：估計權重
- Aliases／符號：weights、wi、wᵢ、Σwi=1、weighted mean
- 白話定義：wᵢ 讀作「w 下標 i」，表示第 i 筆資料占多大比重；Σwᵢ=1 讀作「所有 w 下標 i 的總和等於一」，在各觀察同平均時可讓加權平均維持不偏。
- 生活例子：綜合三支溫度計時給可靠儀器較高權重，但所有採信比例加起來仍是 100%。
- 容易誤解：權重和為 1 只處理中心是否偏移，不保證變異數最小，也不保證權重都必須相同。
- 適用 lesson IDs：lesson-im-stat-unbiased-efficient-estimators

### 4. 估計量變異數與效率

- Preferred label：估計量變異數與效率
- Aliases／符號：estimator variance、efficiency、minimum variance、Var(m)=σ²Σwi²
- 白話定義：估計量變異數衡量答案在重複抽樣間有多晃，在同樣不偏的候選中變異數較小者稱較有效率；Var(m)=σ²Σwᵢ² 讀作「m 的變異數等於 sigma 平方乘權重平方和」。
- 生活例子：兩種溫度合併法都不會長期高估，但每次結果較穩定的那一種效率較高。
- 容易誤解：只有在比較條件一致時才能只靠變異數談效率；資料相關或每筆誤差不同時公式也會改變。
- 適用 lesson IDs：lesson-im-stat-unbiased-efficient-estimators

### 5. 最小化、微分與柯西不等式

- Preferred label：最小化、微分與柯西不等式
- Aliases／符號：minimize、optimization、derivative、Cauchy、Cauchy–Schwarz inequality、α
- 白話定義：最小化是在限制下找讓變異數最小的權重，可用微分找谷底或用柯西不等式比較下界；α 讀作「alpha」，在此只是可調權重參數。
- 生活例子：調整兩支溫度計的採信比例，尋找合成讀數晃動最小的位置。
- 容易誤解：這裡的 α 是權重參數，不是假設檢定的顯著水準；兩者符號相同但角色不同。
- 適用 lesson IDs：lesson-im-stat-unbiased-efficient-estimators

## 5. 讀懂多元迴歸儀表板

### 1. 多元線性迴歸

- Preferred label：多元線性迴歸
- Aliases／符號：multiple regression、multiple linear regression、outcome、predictor、intercept、slope
- 白話定義：多元線性迴歸用一個截距與多個斜率，描述多個預測變數和一個結果變數之間的線性關係。
- 生活例子：同時用家庭人數、收入與居住面積來預測每週垃圾量。
- 容易誤解：迴歸找的是在模型與資料條件下的關聯，單靠係數顯著不能證明某變數造成結果。
- 適用 lesson IDs：lesson-im-stat-regression-dashboard

### 2. 迴歸係數、標準誤與 t 值

- Preferred label：迴歸係數、標準誤與 t 值
- Aliases／符號：coefficient、coef、standard error、std err、SE、t-statistic、t=coef/SE
- 白話定義：係數是估計的影響方向與大小，標準誤 SE 是係數的不確定程度，t=coef/SE 讀作「t 等於係數除以標準誤」，表示效果相對噪音有多大。
- 生活例子：若收入係數是 7 而標準誤約 1，表示估計效果相對其不確定程度算大。
- 容易誤解：t 值不是 p 值，係數大也不必然顯著，還要看標準誤與參考分配。
- 適用 lesson IDs：lesson-im-stat-regression-dashboard

### 3. 殘差與殘差自由度

- Preferred label：殘差與殘差自由度
- Aliases／符號：residual、error、Df Residuals、residual degrees of freedom、df=n-k-1
- 白話定義：殘差是實際值減模型預測值，殘差自由度是扣掉估計參數後仍可用來估計誤差的獨立資訊量；df=n-k-1 讀作「自由度等於樣本數 n 減斜率數 k 再減一」。
- 生活例子：440 戶資料估計 3 個斜率加 1 個截距後，剩下 436 份殘差自由度。
- 容易誤解：Df Model 通常是模型斜率數，不是殘差自由度；公式中的減一通常來自截距。
- 適用 lesson IDs：lesson-im-stat-regression-dashboard

### 4. 決定係數與調整後決定係數

- Preferred label：決定係數與調整後決定係數
- Aliases／符號：R²、R-squared、coefficient of determination、adjusted R²、Adj. R-squared
- 白話定義：R² 讀作「R 平方」，表示模型解釋結果變動的比例；adjusted R² 讀作「調整後 R 平方」，會對加入過多預測變數扣分。
- 生活例子：垃圾量模型的 R²=.17，可白話理解為樣本中約 17% 的垃圾量差異被模型解釋。
- 容易誤解：R² 高不等於模型有因果性或預測一定準，adjusted R² 也不是所有模型品質的唯一標準。
- 適用 lesson IDs：lesson-im-stat-regression-dashboard

### 5. 整體 F 檢定

- Preferred label：整體 F 檢定
- Aliases／符號：F-test、joint F-test、F-statistic、Prob(F-statistic)
- 白話定義：整體 F 檢定把所有斜率同時為 0 當作 H₀，檢查整組預測變數是否共同提供解釋力；F 讀作英文字母「F」。
- 生活例子：不是逐一問每個旋鈕，而是一次問儀表板上的所有旋鈕合起來是否比完全不用更有用。
- 容易誤解：F 檢定顯著只表示至少一個斜率可能非零，不會告訴你是哪一個，也不等於每一個都顯著。
- 適用 lesson IDs：lesson-im-stat-regression-dashboard

## 6. 座位分布是否真的互不相關

### 1. 類別變數與列聯表

- Preferred label：類別變數與列聯表
- Aliases／符號：categorical variable、contingency table、cross-tabulation、r×c table
- 白話定義：類別變數把人或物分組，列聯表則用列與欄記錄兩個類別變數各種組合的人數；r×c 讀作「r 乘 c 的表」。
- 生活例子：用列表示早中晚時段、欄表示飲料種類，每格填入購買人數就是一張列聯表。
- 容易誤解：格子應放計數而非連續測量值；列聯表呈現關聯，不會自動說明原因。
- 適用 lesson IDs：lesson-im-stat-chi-square-independence

### 2. 觀察次數與期望次數

- Preferred label：觀察次數與期望次數
- Aliases／符號：observed count、expected count、O、E、row total×column total/grand total
- 白話定義：O 讀作「觀察次數」，是實際每格人數；E 讀作「期望次數」，是在兩變數獨立時由列合計乘欄合計再除總合計算出的每格預期人數。
- 生活例子：實際晚間買咖啡有 30 人是 O，若時段與飲料無關時按整體比例應有 22 人則是 E。
- 容易誤解：這裡的 E 是期望次數，不是前面 E(X) 的期望值運算符；卡方公式的分母必須用 E。
- 適用 lesson IDs：lesson-im-stat-chi-square-independence

### 3. 皮爾森卡方統計量

- Preferred label：皮爾森卡方統計量
- Aliases／符號：Pearson chi-square、χ²、chi-square statistic、Σ(O-E)²/E
- 白話定義：χ² 讀作「chi-square／卡方」，把每格觀察與期望的差平方後除以期望再全部加總，即 Σ(O-E)²/E 讀作「所有格的 O 減 E 平方除以 E 之和」。
- 生活例子：若多個時段與飲料格子的實際人數都明顯偏離獨立時預期人數，χ² 就會變大。
- 容易誤解：χ² 不會是負數，數值大小要搭配自由度或 p 值判斷，不能用固定門檻套所有表格。
- 適用 lesson IDs：lesson-im-stat-chi-square-independence

### 4. 卡方檢定自由度

- Preferred label：卡方檢定自由度
- Aliases／符號：degrees of freedom、df、df=(r-1)(c-1)
- 白話定義：自由度 df 讀作「d-f」，表示固定列欄合計後還能獨立變動的格子資訊量；df=(r-1)(c-1) 讀作「r 減一乘 c 減一」。
- 生活例子：2×3 列聯表的自由度是 (2-1)(3-1)=2。
- 容易誤解：自由度不是格子總數 rc，也不是樣本數；列欄合計帶來的限制必須扣除。
- 適用 lesson IDs：lesson-im-stat-chi-square-independence

### 5. 臨界值與獨立性結論

- Preferred label：臨界值與獨立性結論
- Aliases／符號：critical value、independence test、reject independence、association、causation
- 白話定義：臨界值是在指定 α 與自由度下的拒絕界線，若 χ² 超過它就拒絕「兩類別變數獨立」的 H₀，只能說資料顯示有關聯。
- 生活例子：χ²=6.42 高於 df=2、α=.05 的臨界值 5.99，表示時段與商品選擇的分布不像完全無關。
- 容易誤解：拒絕獨立不代表一個變數造成另一個；樣本不獨立、期望次數太小或抽樣偏誤也可能讓結論失真。
- 適用 lesson IDs：lesson-im-stat-chi-square-independence

## 建議的內容改寫順序

1. 情境問題：先讓讀者猜答案，不出現公式。
2. 白話概念：一次只引入一個 preferred label。
3. 英文與符號：緊接著標示 aliases 與「怎麼讀」。
4. 對照例子：把生活角色逐一換成公式中的量。
5. 考題公式：最後才完整顯示，並逐符號說明。
6. 誤解提醒：在練習前提示最常犯的概念錯誤。

## Closure 檢查

- 共 30 個核心詞；六堂課各 5 詞，符合每堂 3–6 詞的負荷上限。
- 每詞都有繁中 preferred label、aliases／符號、單句白話定義、生活例子、誤解提醒與 lesson ID。
- 涉及公式的詞均在白話定義中交代符號讀法；α 的兩種角色、E 的兩種角色另有明確消歧。

