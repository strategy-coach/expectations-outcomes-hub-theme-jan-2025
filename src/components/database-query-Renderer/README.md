
# 📄 DatabaseQueryRenderer

The `DatabaseQueryRenderer` component in Astro allows you to fetch data from an SQLite database and render it in different layouts such as **Table, JSON List, or Card List**.

## 🚀 Usage

Import the component in your Astro file:

```tsx
import DatabaseQueryResult from "../../../components/database-query-Renderer/databaseQueryRenderer.astro";
```

Then, use it in your Astro template by passing the necessary props:\
**Employee List in Card Format**

```tsx
<DatabaseQueryResult
  title="Employee Card"
  layout="card"
  dbName="employee_db.db"
>
  {`SELECT first_name || ' ' || last_name AS title, 
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
    when an unknown printer took a galley of type and scrambled it to make a type specimen book" 
    AS description 
    FROM employees 
    LIMIT 6`}
</DatabaseQueryResult>
```

### ⚠️ Important Note

All layouts can use any query, but the **card layout** must have a `title` and optionally a `description` field. You **must** add a `title`, but `description` is optional.


### 🎨 Layout Options

| Layout Type | Description                                    |
| ----------- | ---------------------------------------------- |
| `table`     | Displays the query result in a tabular format. |
| `json`      | Renders the query result as a JSON list.       |
| `card`      | Shows the data as a card-based layout.         |

### 🔹 More Examples

#### **Employee List in JSON Format**

```tsx
<DatabaseQueryResult
  title="Employee List"
  layout="json"
  dbName="employee_db.db"
>
  {`SELECT first_name || ' ' || last_name AS full_name FROM employees`}
</DatabaseQueryResult>
```

#### **Employee Table View**

```tsx
<DatabaseQueryResult
  title="Employee Table"
  layout="table"
  dbName="employee_db.db"
>
  {`SELECT * FROM employees`}
</DatabaseQueryResult>
```

## 📷 Screenshots

Below are some example images showcasing the component in different layouts:

## Card layout

![alt text](image.png)

## json layout

![alt text](image-1.png)

### Table layout

![alt text](image-2.png)



## ⚙️ Props

| Prop       | Type      | Description                       |          |                               |
| ---------- | --------- | --------------------------------- | -------- | ----------------------------- |
| `title`    | `string`  | Title of the section.             |          |                               |
| `layout`   | \`"table" | "json"                            | "card"\` | Specifies the display format. |
| `dbName`   | `string`  | Name of the SQLite database file. |          |                               |
| `children` | `string`  | SQL query to fetch data.          |          |                               |

## 🛠️ Error Handling

- If the database does **not** exist, an error message will be displayed instead of crashing the app.
- If an invalid `layout` is provided, a **default message** is shown.

## 📌 Notes

- The database file (`dbName`) must be present in the working directory.
- Ensure your SQL query returns data in a format suitable for the selected layout.



