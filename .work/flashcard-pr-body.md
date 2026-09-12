## What changed

- 將資管所英文閃卡重建為 4,728 張直接單字卡
- 移除重複的選擇題與固定句型模板
- 加入單字庫產物、覆蓋率與品質驗證
- 改善閃卡 API 載入、SRS 與複習流程

## Why

正式站的資管英文閃卡混入大量題庫內容，並有數千張重複的 `The professor emphasized...` 模板，無法作為單字閃卡正常複習。

## Impact

資管英文閃卡將由 5,452 張混合題目改為 4,728 張必要單字的直接問答卡；固定重複模板降為 0。

## Validation

- `npm run validate:content`
- `npm run check:im-vocab`（4,728 generated，0 missing meanings）
- `npm test -- --runInBand`（22 suites / 256 tests passed）
- `npm run typecheck`
- `npm run build`
