# lhc-forms-widget

## Overview
`lhc-forms-widget` is an Astro component used to display LForms. Form definitions are stored in a JSON structure, which can be either:
- **FHIR Questionnaire** (recommended)
- **LHC-Forms internal format**

This component renders the form as HTML, making it easier to integrate structured forms into your Astro project.

## Installation
Ensure that your project is set up with Astro and that the required dependencies are installed.

## Environment Setup
Set the database path in your environment variables:
```env
PUBLIC_LFORM_DB="path/db"
```
This specifies the path where the LForms database is stored.

## Usage
Import the `LHCFormsWidget` component into your Astro file:
```tsx
import LHCFormsWidget from "../../components/lhc-forms-widget/lhc-forms-widget.astro";
```

Use the component in your Astro template:
```tsx
<LHCFormsWidget fileName={fileName} />
```
### Parameters
- **fileName**: The JSON file containing the form definition. This file should be stored inside:
  ```
  src/content/lforms
  ```

### Handling Form Submissions
After submitting the `LHCFormsWidget`, the response is saved in:
```
src/content/lforms/submissions
```
as a JSON file.

This file needs to be ingested with Surveilr using the following command:
```sh
surveilr ingest files -r src/content/lforms -d src/content/db/lforms/resource-surveillance.sqlite.db
```
This will create a database at:
```
src/content/db/lforms/
```

### Displaying Submitted Form Responses
Import the `LHCFormsResponseWidget` component into your Astro file:
```tsx
import LHCFormsResponseWidget from "../../components/lhc-forms-widget/ihc-form-response-widget.astro";
```

Use the component in your Astro template:
```tsx
<LHCFormsResponseWidget fileName={submittedForm} />
```
- **submittedForm**: The file name passed to `LHCFormsResponseWidget` is the JSON file generated after submitting the form.

## File Structure
Ensure your project follows this structure:
```
project-root/
├── src/
│   ├── components/
│   │   ├── lhc-forms-widget/
│   │   │   ├── lhc-forms-widget.astro
│   │   │   ├── ihc-form-response-widget.astro
│   ├── content/
│   │   ├── lforms/
│   │   │   ├── example-form.json
│   │   │   ├── submissions/
│   │   ├── db/
│   │   │   ├── lforms/
├── .env
```

## Notes
- It is recommended to use FHIR Questionnaire format for form definitions.
- The component will dynamically render the provided form as HTML.
- Submitted form responses can be ingested into Surveilr for further processing..



