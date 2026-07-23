export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}`;
}

export function formatDateTime(dateStr: string, timeStr?: string): string {
  let result = formatDate(dateStr);
  if (timeStr) result += ` ${timeStr}`;
  return result;
}

export function getYearMonth(dateStr: string): { year: string; month: string } {
  const [y, m] = dateStr.split('-');
  return { year: y, month: m };
}

export function getYear(dateStr: string): string {
  return dateStr.split('-')[0] || '';
}

export function getMonthName(month: string): string {
  const names = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return names[parseInt(month) - 1] || '';
}

export function groupByYearMonth(memories: { date: string }[]): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>();
  for (const m of memories) {
    const { year, month } = getYearMonth(m.date);
    if (!map.has(year)) map.set(year, new Map());
    const monthMap = map.get(year)!;
    monthMap.set(month, (monthMap.get(month) || 0) + 1);
  }
  return map;
}

export function sortByDateDesc(a: { date: string }, b: { date: string }): number {
  return b.date.localeCompare(a.date);
}

export function sortByDateAsc(a: { date: string }, b: { date: string }): number {
  return a.date.localeCompare(b.date);
}

export function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return '今天';
  if (days === 1) return '昨天';
  if (days < 30) return `${days}天前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '…';
}

export function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context failed')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compression failed')); return; }
            const fileReader = new FileReader();
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

export function getPlaceholderColor(index: number): string {
  const colors = [
    '#E8F3FA', '#EDF5FA', '#F4F8FB',
    '#D4E8F2', '#F0DFAE', '#E8D59A',
    '#D4E8F2', '#FDF8F0', '#E8F3FA',
  ];
  return colors[index % colors.length];
}
