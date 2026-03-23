/** Maps tool route id (e.g. doc-to-udf) to messages key prefix (docToUdf). */
export function toolIdToMessagePrefix(id: string): string {
    return id
        .split("-")
        .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join("");
}
