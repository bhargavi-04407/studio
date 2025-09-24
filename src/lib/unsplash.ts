'use server';

// A simple function to search for an image on Unsplash
// In a real app, you should use the official Unsplash API client
// and handle errors more gracefully.
export async function searchUnsplash(query: string): Promise<string | undefined> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn("Unsplash Access Key not found. Skipping image search. Please set UNSPLASH_ACCESS_KEY in your .env file.");
    // Returning a placeholder image if the key is not set
    return `https://picsum.photos/seed/${encodeURIComponent(query)}/600/400`;
  }
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${accessKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch image from Unsplash:', response.statusText);
      return `https://picsum.photos/seed/${encodeURIComponent(query)}/600/400`;
    }
    const data = await response.json();
    return data.results?.[0]?.urls?.regular;
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return `https://picsum.photos/seed/${encodeURIComponent(query)}/600/400`;
  }
}
