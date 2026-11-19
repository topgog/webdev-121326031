# Lab Booking · TU-Sofia

<!-- Exercise 2. Write the non-goals first. Every acceptance criterion must be checkable in under a minute.
     Keep these headings exactly as they are: the self-checks look for them by name.
     The full target is on the course site under Resources → The course project. -->

## Project option
Lab booking.

## Goals

- Студент влиза в системата, вижда кои работни станции са свободни за избран ден и резервира една за един блок от разписанието.
- Студент отменя собствената си резервация, а персоналът добавя лаборатории и станции и вижда всички резервации за деня.

## Non-goals

- No payments or fees: booking a workstation is free.
- No email or push notifications: users look at the site to see their bookings.
- No mobile app: one web UI that also works on a phone screen.
- No recurring bookings or waiting lists: one booking is one workstation for one block of one day.

## Constraints

- Node.js 22 с Express и SQLite при разработка; в production същата логика работи върху PostgreSQL (Neon).
- Паролите се съхраняват само като хеш, никога като четим текст.
- Демо акаунтите се създават само при първи старт в разработка, със случайни пароли, които се печатат веднъж в терминала; в git и в production няма акаунт с известна парола.

## The model feature

- Model: Gemini 3.5 Flash-Lite (текст), извиква се само от `src/services/suggest.js`.
- Input: изречение на студента (например „тиха машина за трима, четвъртък следобед") и деня; нищо друго за потребителя.
- Output: една предложена работна станция и блок, избрани само от свободните; студентът я потвърждава, преди нещо да се запише.
- When it fails: при липса на ключ, timeout или 429 приложението предлага най-ранния свободен блок по собствено правило и показва, че това е резервният вариант; предложение, което не е в списъка със свободни места, се отхвърля.

## Auth

- Local: имейл и парола, паролата се съхранява като scrypt хеш със сол.
- Provider: вход с Google (authorization code flow, на сървъра, със `state` и PKCE).
- Linking: акаунтите се свързват по имейл само когато Google е маркирал имейла като потвърден, така че един човек остава един акаунт.

## MCP tools

| Tool | What it does | Who may call it |
| --- | --- | --- |
| `list_free_slots` | Lists the free workstation and block pairs for a given day | the token's owner |
| `my_bookings` | Lists the upcoming bookings of the signed-in student | the token's owner |
| `book_slot` | Books a workstation for a block, refusing one that is already taken | the token's owner |
| `cancel_booking` | Cancels one of the student's own bookings and frees the block | the token's owner |
| `suggest_slot` | Turns a sentence into one free workstation and block suggestion | the token's owner |

## UI

Обикновен HTML, CSS и JavaScript без framework. Четири екрана: вход, свободни станции за деня с резервиране, „Моите резервации" и добавяне на лаборатория (само за персонал). Чеклистът е в `docs/UI.md`.

## Architecture
<!-- Exercise 3. One request traced through every layer, naming the file for each one,
     plus one place where your own code does not match this layering. -->

## Acceptance criteria

- [AC-1] Студент, който е влязъл, избира ден и вижда за всяка работна станция кои блокове са свободни и кои заети.
- [AC-2] Студент, който резервира свободна станция за блок, вижда резервацията в „Моите резервации" и в таблицата `bookings` се появява нов ред.
- [AC-3] Опит за резервация на вече заета станция за същия ден и блок връща 409 със съобщение, което назовава станцията, и в `bookings` не се добавя ред.
- [AC-4] Опит за четвърта предстояща резервация от същия студент връща 409 и в `bookings` той остава с три реда.
- [AC-5] Студент, който отменя собствената си резервация, я вижда да изчезва от списъка, а блокът отново е свободен за другите.
- [AC-6] Студент, който се опита да отмени чужда резервация, получава 403 и редът в `bookings` остава.
- [AC-7] Служител на лабораторията добавя лаборатория и работна станция, а студент не вижда бутона за добавяне и получава 403, ако изпрати заявката.
- [AC-8] Потребител, който се е регистрирал с парола и после влезе с Google със същия потвърден имейл, влиза в същия акаунт и в `users` не се появява втори ред.


### Slice 1: sign-in and the list of labs

- [AC-9] Посетител, който отвори `/labs` без да е влязъл, е пренасочен към `/login`.
- [AC-10] След влизане с демо акаунт `/labs` показва двете демо лаборатории, всяка с име и брой работни станции.
- [AC-11] Ако изтрия един ред от таблицата `labs` и презаредя `/labs`, лабораторията изчезва от екрана.

## Traceability
<!-- Filled in from Exercise 3 onward: each AC id, and the test that names it. -->
| Criterion | Test |
| --- | --- |
| AC-1 |  |

## Spec vs result

Всички три критерия от Slice 1 минаха: AC-9, AC-10 и AC-11 ги проверих ръчно в браузъра (за AC-11 изтрих реда от `labs` със sqlite3 и презаредих), а `npm test` ги покрива с тестове, чиито заглавия съдържат id-то.
Агентът (Claude, защото Gemini CLI не работеше) направи неща, които спецификацията не изисква: бутон „Изход", името на влезлия в ъгъла и списък, който се зарежда през `/api/labs`.
Спецификацията не казва откъде идва „демо акаунтът" от AC-10. Агентът избра сам: акаунтите се създават при първия старт със случайни пароли, които се печатат веднъж в терминала.
Заради това добавям в Constraints ред за демо акаунтите.
