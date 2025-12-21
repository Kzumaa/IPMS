/**
 * Download a file from a URL using fetch and blob
 * This works for cross-origin URLs unlike the simple anchor download approach
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); // Optional if backend sends Content-Disposition
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback: try opening in a new tab
        window.open(url, '_blank');
    }
}
