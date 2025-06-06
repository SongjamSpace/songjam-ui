+----------------------------+      +-----------------------------+      +------------------------------+
|         FRONTEND          |      |           BACKEND           |      |            STORAGE           |
+----------------------------+      +-----------------------------+      +------------------------------+
|                            |      |                             |      |                              |
|  React.js Application      |<---->| Firebase Auth               |<---->|                              |
|                            |      |  - Username/Password Login  |      |                              |
|  Role-based Dashboards     |      |  - Custom Claims for Roles  |      |                              |
|  (Student / Teacher / Admin)|     |                             |      |                              |
|                            |      | Firebase Functions          |      |                              |
|  Video Player w/ MCQs      |<---->|  - Evaluate Answers         |      |  Firebase Hosting            |
|                            |      |  - Game Result Processing   |<-----|  - Serves React App          |
|  Monaco Code Editor        |<---->|  - Aggregate Progress       |      |                              |
|                            |      |                             |      |                              |
|  Unity Game (iframe)       |<---->|                             |      |  Firebase Storage            |
|                            |      | Firestore Database          |<---->|  - Stores Videos, Games      |
|  Assignment Forms          |<---->|  - Users, Sessions          |      |                              |
|                            |      |  - Assignments, Results     |      |                              |
+----------------------------+      +-----------------------------+      +------------------------------+
