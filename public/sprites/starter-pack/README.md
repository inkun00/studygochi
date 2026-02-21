# Game UI Starter Pack (mrtnli)

StudyGotchi는 [FREE Game UI Starter Pack - Pixel Art](https://mrtnli.itch.io/game-ui-starter-pack)을 사용합니다.

## 설치 방법

1. https://mrtnli.itch.io/game-ui-starter-pack 에 접속
2. **Download** 클릭 (Name your own price → $0 가능)
3. `Assets.zip` 다운로드
4. 압축 해제 후 **이 폴더(`public/sprites/starter-pack/`)에** 파일을 넣으세요.

## 필요한 파일 매핑

압축 해제된 파일명이 아래와 다를 수 있습니다. 그 경우 `src/lib/ui-starter-pack.ts`에서 경로를 수정하세요.

| 용도 | 예상 파일명 | 비고 |
|-----|------------|------|
| 창/패널 | `window.png` | 9-slice 호환 윈도우 |
| 버튼 | `button.png` | 일반 상태 |
| 버튼(눌림) | `button_pressed.png` | pressed 상태 |

팩에 포함: 8개 버튼, 4개 윈도우, 8개 슬라이더, 30개 아이콘.  
필요에 따라 `ui-starter-pack.ts`에 경로를 추가할 수 있습니다.
