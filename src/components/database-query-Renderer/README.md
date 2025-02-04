# 📄 SurveilrDBRenderer

The `SurveilrDBRenderer` component in Astro allows you to fetch data from an SQLite database and render it in different layouts such as **Table, JSON List, or Card List**. It also includes a **detail view** feature for `card` and `table` layouts.

## 🚀 Usage

Import the component in your Astro file:

```tsx
import SurveilrDBRenderer from "../../../components/database-query-renderer/SurveilrDBRenderer.astro";
```

Then, use it in your Astro template by passing the necessary props:

### **Employee List in Card Format with Detail View**

```tsx
<SurveilrDBRenderer
  identifier="employee_card"
  title="Employee Card"
  layout="card"
  dbName="database-query-renderer-demo/employee.db"
  table="employees"
  fields=[
    "first_name || ' ' || last_name AS title",
    `"Lorem Ipsum is simply dummy text of the printing and typesetting industry..." AS description`
  ]
  where=""
  orderBy="first_name ASC"
  limit="6"
  detail={true}
  detailWhere={["title"]}
/>
```

### ⚠️ Important Notes

- All layouts can use any query, but the **card layout** must have a `title` field in `fields`. The `description` field is optional.
- **Detail view** is only available for `card` and `table` layouts.
- The `detailWhere` prop determines which fields should be used to filter detail views.

### 🎨 Layout Options

| Layout Type | Description                                    |
| ----------- | ---------------------------------------------- |
| `table`     | Displays the query result in a tabular format. |
| `json`      | Renders the query result as a JSON list.       |
| `card`      | Shows the data as a card-based layout.         |

### 🔹 More Examples

#### **Employee List in JSON Format**

```tsx
<SurveilrDBRenderer
  title="Employee List"
  layout="json"
  dbName="database-query-renderer-demo/employee.db"
  fields={['*']}
  table="employees"
  where=""
  orderBy=""
  limit="2"
/>
```

#### **Employee Table View with Detail View**

```tsx
<SurveilrDBRenderer
  identifier="employee_table"
  title="Employee Table"
  layout="table"
  dbName="database-query-renderer-demo/employee.db"
  fields={['*']}
  table="employees"
  where=""
  orderBy=""
  limit="2"
  detail={true}
  detailWhere={["first_name", "last_name"]}
/>
```

## 📷 Screenshots

Below are some example images showcasing the component in different layouts:

### Card layout

![alt text](image.png)

### JSON layout

![alt text](image-1.png)

### Table layout

![alt text](image-2.png)

### Detail View

![alt text](image.png)

## 📌 Examples

Additional examples showcasing different implementations and use cases will be provided here.

## ⚙️ Props

| Prop         | Type       | Description                                    |
| ------------ | ---------- | ---------------------------------------------- |
| `identifier` | `string`   | Unique identifier for the instance.           |
| `title`      | `string`   | Title of the section.                         |
| `layout`     | `"table" \| "json" \| "card"` | Specifies the display format. |
| `dbName`     | `string`   | Name of the SQLite database file.             |
| `table`      | `string`   | Name of the table to query.                   |
| `fields`     | `string[]` | Array of fields to select. Defaults to `*`.   |
| `where`      | `string`   | SQL WHERE clause.                             |
| `orderBy`    | `string`   | SQL ORDER BY clause.                          |
| `limit`      | `number`   | Limit the number of results.                  |
| `detail`     | `boolean`  | Enables detail view (only for `card` & `table`). |
| `detailWhere` | `string[]` | Fields to use for filtering in the detail view. |

## 🛠️ Error Handling

- If the database does **not** exist, an error message will be displayed instead of crashing the app.
- If `layout` is "card" and `fields` does not include a `title` field, an error will be thrown where the component is used.
- If an invalid `layout` is provided, a **default message** is shown.
- If `detail` is enabled for `json` layout, an error will be thrown.

## 📌 Notes

- The database file (`dbName`) must be present in the working directory.
- Ensure your SQL query returns data in a format suitable for the selected layout.
- The `detail` feature works only for `card` and `table` layouts.

