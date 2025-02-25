# Plan for Todo App Improvements

This document outlines a plan to address the reported issues and improve the overall quality of the todo app.

## Issues

1.  **Content Security Policy (CSP) Violation:** The browser is blocking an inline image due to a missing `img-src` directive in the CSP.
2.  **Server Error (500):** The app is throwing an internal server error, likely due to unhandled errors in the `/todo/destroy` route.
3.  **ESLint Warning:** An unused variable (`err`) is present in `app/routes/front.js`.
4. **General Instability**

## Proposed Solutions

### 1. Address CSP Violation

*   **Action:** Add a `Content-Security-Policy` header to the response in the `router.get('/')` handler in `app/routes/front.js`.
*   **Implementation:**
    ```javascript
    router.get('/', async (req, res) => {
        res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; script-src 'self'");
        const todos = await Todo.find()
        res.render("todos", {
            todos: todos
        });
    });
    ```
*   **Rationale:** This sets a restrictive CSP that allows images from the same origin and data URIs (inline images), and scripts from the same origin. This resolves the browser error and improves security.

### 2. Fix 500 Error and ESLint Warning

*   **Action:** Implement proper error handling in the `router.post('/todo/destroy', ...)` route handler in `app/routes/front.js`.
*   **Implementation:**
    ```javascript
    router.post('/todo/destroy', async (req, res) => {
        const taskKey = req.body._key;
        try {
            const result = await Todo.findOneAndRemove({_id: taskKey});
            if (!result) {
                // Handle the case where the todo item is not found
                return res.status(404).send('Todo item not found');
            }
            res.redirect('/');
        } catch (err) {
            console.error(err); // Log the error for debugging
            res.status(500).send('Error deleting todo item'); // Send a generic error message to the client
        }
    });
    ```
*   **Rationale:** This adds a `try...catch` block to handle potential errors during the database operation. It also checks if a todo item to be deleted exists. If an error occurs, it logs the error and sends a 500 status with a user-friendly message.  This prevents the server from crashing and provides a better user experience. The `err` variable is replaced with `result` and is used.

### 3. Broader Improvements

#### 3.1. Refactoring and Error Handling

* **Action:**  Add `try...catch` blocks to *all* route handlers in `app/routes/front.js` to handle potential errors gracefully.
*   **Implementation:** Wrap the logic within each route handler (including `router.get('/')` and `router.post('/')`) with `try...catch` blocks, similar to the example above.
*   **Rationale:** Consistent error handling prevents unexpected server crashes and improves the user experience.

#### 3.2 Input Validation

*   **Action:** Implement server-side validation for the `task` input in the `router.post('/')` route handler.
*   **Implementation:**
    ```javascript
    router.post('/', (req, res) => {
        const task = req.body.task;

        if (!task || task.trim() === '') {
            return res.status(400).send('Task cannot be empty');
        }

        const newTask = new Todo({
            task: task
        });

        newTask.save()
        .then(task => res.redirect('/'))
        .catch(err => {
            console.error(err);
            res.status(500).send('Error saving task');
        });
    });
    ```
* **Rationale:**  This prevents empty tasks from being added to the database, improving data integrity and preventing potential errors.  It also sends a 400 Bad Request status if the input is invalid.

#### 3.3. Modernization

*   **Action:** Consider updating dependencies to their latest versions (using `npm update`).
*   **Rationale:** Newer versions often include bug fixes, performance improvements, and security patches.

#### 3.4 UI/UX Improvements
* **Action:** Review and potentially improve `app/views/todos.ejs`.
* **Implementation:**
    *   **Loading Indicators:** Add a loading indicator to the "Add Task" button and the "Delete" button to provide visual feedback during database operations.
    *   **Confirmation Dialog:** Implement a confirmation dialog before deleting a task to prevent accidental deletions.
    *   **Error Messages:** Display user-friendly error messages on the page (e.g., if adding a task fails).
    *   **Accessibility:** Ensure the HTML is semantically correct and accessible (e.g., using ARIA attributes).
    * **Duplicate Styling:** Remove duplicate styling in `app/views/todos.ejs`.
*   **Rationale:** These changes enhance the user experience and make the app more robust.
