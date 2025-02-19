# **IMAP Mail Box Component**  

The **imap-mail-box** component is an Astro component used to display ingested emails from any mail source in **EOH**.  

---

## **Environment Configuration**  

Before using the component, set up the required **environment variables**:  

### **Required Environment Variables**  

| Variable            | Description                                         | Example Value |
|--------------------|-------------------------------------------------|--------------|
| `ENABLE_IMAP_VIEW` | Enable or disable IMAP ingestion (`true/false`). If `true`, it will ingest mail content. | `true` |
| `PUBLIC_IMAP_DB`   | Path to the IMAP database. **Do not change this path.** | `src/content/db/imap-mail-db/resource-surveillance.sqlite.db` |
| `IMAP_FOLDER`      | The IMAP folder to fetch emails from. | `Inbox` |
| `IMAP_USER_NAME`   | IMAP account username. | `your_email@example.com` |
| `IMAP_PASS`        | IMAP account password. | `your_password` |
| `IMAP_HOST`        | IMAP server host. | `imap.example.com` |

---

## **Setup & Running Locally**  

### **1. Install Surveilr**  

To complete **IMAP ingestion**, make sure you have **Surveilr** installed. If not, follow the installation guide:  

📖 [Surveilr Installation Guide](https://www.surveilr.com/docs/core/installation/)  

### **2. Prepare the Database**  

After setting up the environment variables, run the following command in the **root terminal**:  

```sh
pnpm run prepare-imap-db
```
  
This command will automatically create the database in the specified directory.  

⚠️ **Make sure the target directory exists before running the command.**  

---

## **Using the Component in Astro**  

### **Astro SSR Requirement**  

The **imap-mail-box** component is built for **Astro Server-Side Rendering (SSR)** and **will only work in SSR mode**.  

### **Importing the Component**  

To use the component in an **Astro page**, import it as follows:  

```astro
import MailBox from "../../components/imap-mail-box/mailBox.astro";

<MailBox />
```

---

## **Query Parameters**  

- If **no `account` ID** is passed in the URL (`?account=****&view=list`), the component will **automatically select** the first ingested account.  
- **Required query parameters:**  
  - `account` → Specifies the account ID.  
  - `view=list` → Must be set to `"list"`.  

**Example URL:**  

``` http://localhost:3000/?account=1234&view=list ```

⚠️ **Ensure you follow the correct query parameter names to prevent bugs.**  

---

## **Notes**  

- The component will **only display ingested emails** if `ENABLE_IMAP_VIEW` is set to `true`.  
- Ensure that **Surveilr is installed and configured correctly** before running the ingestion process.  
- Provide valid IMAP credentials and database configurations for successful ingestion.  

---
