export default function numMipLevels(...sizes: number[]) {
	const maxSize = Math.max(...sizes);
	return (1 + Math.log2(maxSize)) | 0;
}
