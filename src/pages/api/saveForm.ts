import { writeFile } from 'fs/promises';
import type { APIContext } from 'astro';

export async function POST({ request }: APIContext) {
    try {
        const { formData, fileName, userId } = await request.json();
        // Define the file path (modify as needed)
        const filePath = `./src/content/lforms/submissions/${userId}.${fileName}.lform-submittion.json`;

        // Write form data to a file
        await writeFile(filePath, JSON.stringify(formData, null, 2), 'utf-8');

        return new Response(JSON.stringify({ message: "Form data saved successfully!" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to save form data" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
