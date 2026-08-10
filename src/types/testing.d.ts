// jest.setup.js 在執行期載入 @testing-library/jest-dom，這裡把它的 matcher 型別
// （toBeInTheDocument 等）一併掛進來，否則 tsc 看不到而報 TS2339。
import '@testing-library/jest-dom'
