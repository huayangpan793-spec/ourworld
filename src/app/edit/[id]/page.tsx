'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMemoryStore } from '@/lib/store';
import { MAX_PHOTOS, DEFAULT_TAGS, MEMORY_TYPES, PLANET_COLORS, PlanetColor, MemoryType, Importance } from '@/lib/types';
import { PlanetIcon } from '@/components/ui/PlanetIcon';
import { compressImage } from '@/lib/utils';

export default function EditMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const memory = useMemoryStore((s) => s.memories.find((m) => m.id === id));
  const updateMemory = useMemoryStore((s) => s.updateMemory);
  const selectMemory = useMemoryStore((s) => s.selectMemory);
  const showToast = useMemoryStore((s) => s.showToast);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('花');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [importance, setImportance] = useState<Importance>(2);
  const [memoryType, setMemoryType] = useState<MemoryType>('travel');
  const [anniversary, setAnniversary] = useState(false);
  const [visitedStatus, setVisitedStatus] = useState<'visited' | 'future'>('visited');
  const [planetColor, setPlanetColor] = useState<PlanetColor>('venus');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setSummary(memory.summary);
      setContent(memory.content);
      setAuthor(memory.author);
      setDate(memory.date);
      setTime(memory.time || '');
      setLocationName(memory.locationName);
      setCity(memory.city || '');
      setCountry(memory.country || '');
      setLatitude(memory.latitude);
      setLongitude(memory.longitude);
      setPhotos(memory.photos);
      setPhotoCaptions(memory.photoCaptions);
      setTags(memory.tags);
      setImportance(memory.importance);
      setMemoryType(memory.memoryType);
      setAnniversary(memory.anniversary);
      setVisitedStatus(memory.visitedStatus);
      setPlanetColor((memory.color || 'venus') as PlanetColor);
    }
  }, [memory]);

  if (!memory) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
        <div className="text-center">
          <p className="text-deep-400 mb-2 font-[family-name:var(--font-body)]">正在加载记忆...</p>
          <button onClick={() => router.push('/globe')} className="text-sm text-sky-500 hover:text-sky-600 underline">返回星球</button>
        </div>
      </div>
    );
  }

  const handlePhotoAdd = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = fileArray.slice(0, remaining);
    // Show local preview immediately
    const previews = await Promise.all(
      toProcess.map(async (file) => {
        try { return await compressImage(file, 400, 0.6); }
        catch { return null; }
      })
    );
    const valid = previews.filter(Boolean) as string[];
    setPhotos((prev) => [...prev, ...valid]);
    setPhotoCaptions((prev) => [...prev, ...valid.map(() => '')]);
    // Upload full-size to Supabase in background
    (async () => {
      const { uploadPhoto } = await import('@/lib/upload');
      for (let i = 0; i < toProcess.length; i++) {
        const url = await uploadPhoto(toProcess[i]);
        if (url) {
          setPhotos((prev) => {
            const next = [...prev];
            next[next.length - toProcess.length + i] = url;
            return next;
          });
        }
      }
    })();
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoCaptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) { showToast('请给这段记忆取一个名字'); return; }
    setSaving(true);
    try {
      updateMemory(id, {
        title: title.trim(), summary: summary.trim(), content: content.trim(),
        author: author.trim(), date, time: time || undefined,
        locationName: locationName.trim(), city: city || undefined, country: country || undefined,
        latitude, longitude, photos, coverPhoto: photos[0] || '', photoCaptions,
        tags, importance, memoryType, visitedStatus, anniversary, color: planetColor,
      });
      showToast('记忆已更新');
      selectMemory(id);
      useMemoryStore.getState().syncToSupabase();
      router.push('/globe');
    } catch {
      showToast('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      <div className="sticky top-0 z-20 bg-white/40 backdrop-blur-md border-b border-sky-200/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors" aria-label="返回">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-[family-name:var(--font-title)] text-deep-700 flex-1">编辑记忆</h1>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>保存</Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5">
          <h2 className="text-sm font-medium text-deep-700 mb-3">地点</h2>
          <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 placeholder-deep-300 outline-none focus:border-sky-400/50 transition-all" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="城市" className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all" />
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="国家" className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all" />
          </div>
        </section>

        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5">
          <h2 className="text-sm font-medium text-deep-700 mb-3">日期与时间</h2>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all" />
          </div>
        </section>

        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5 space-y-4">
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">记忆标题 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all" />
          </div>
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">一句话摘要</label>
            <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all" />
          </div>
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">故事正文</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all resize-none font-[family-name:var(--font-body)] leading-relaxed" />
          </div>
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">记录者</label>
            <select value={author} onChange={(e) => setAuthor(e.target.value)} className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all">
              <option value="花">花</option>
              <option value="灵">灵</option>
            </select>
          </div>
        </section>

        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5">
          <h2 className="text-sm font-medium text-deep-700 mb-3">照片（{photos.length}/{MAX_PHOTOS}）</h2>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-sky-50">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <input type="text" value={photoCaptions[i] || ''} onChange={(e) => { const c = [...photoCaptions]; c[i] = e.target.value; setPhotoCaptions(c); }} placeholder="说明…" className="absolute bottom-0 inset-x-0 bg-white/70 backdrop-blur-sm text-[10px] px-1.5 py-1 text-deep-500 outline-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button onClick={() => handlePhotoRemove(i)} className="absolute top-1 right-1 p-0.5 rounded-full bg-white/60 text-deep-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="删除照片"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
          {photos.length < MAX_PHOTOS && (
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handlePhotoAdd(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-sky-400 bg-sky-50/30' : 'border-sky-200/30 hover:border-sky-300/40'}`}>
              <ImageIcon size={24} className="mx-auto text-deep-300 mb-2" />
              <p className="text-xs text-deep-400">点击或拖拽上传照片</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => e.target.files && handlePhotoAdd(e.target.files)} />
        </section>

        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5">
          <h2 className="text-sm font-medium text-deep-700 mb-3">标签</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {DEFAULT_TAGS.map((tag) => (
              <button key={tag} onClick={() => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} className={`text-xs px-3 py-1 rounded-full border transition-all ${tags.includes(tag) ? 'bg-sky-100/60 border-sky-300/40 text-sky-600' : 'bg-white/40 border-sky-200/20 text-deep-400'}`}>{tag}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customTag} onChange={(e) => setCustomTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (customTag.trim() && !tags.includes(customTag.trim())) { setTags([...tags, customTag.trim()]); setCustomTag(''); } } }} className="flex-1 bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all" />
            <Button variant="secondary" size="sm" onClick={() => { if (customTag.trim() && !tags.includes(customTag.trim())) { setTags([...tags, customTag.trim()]); setCustomTag(''); } }}>添加</Button>
          </div>
        </section>

        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5 space-y-4">
          <h2 className="text-sm font-medium text-deep-700 mb-3">更多设置</h2>
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">记忆类型</label>
            <select value={memoryType} onChange={(e) => setMemoryType(e.target.value as MemoryType)} className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all w-full">
              {MEMORY_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">重要程度</label>
            <div className="flex gap-2">
              {([1, 2, 3] as Importance[]).map((level) => (
                <button key={level} onClick={() => setImportance(level)} className={`flex-1 py-2 rounded-xl text-xs border transition-all ${importance === level ? 'bg-gold-100/40 border-gold-300/40 text-deep-700' : 'bg-white/40 border-sky-200/20 text-deep-400'}`}>{level === 1 ? '普通' : level === 2 ? '重要' : '特别重要'}</button>
              ))}
            </div>
          </div>

          {/* 行星色彩 */}
          <div>
            <label className="text-xs text-deep-400 mb-2 block">记忆色彩</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(PLANET_COLORS) as [PlanetColor, typeof PLANET_COLORS[PlanetColor]][]).map(([key, p]) => (
                <button key={key} onClick={() => setPlanetColor(key)} className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-xs transition-all" style={{ borderColor: planetColor === key ? p.hex : 'rgba(158,203,227,0.2)', background: planetColor === key ? `${p.hex}20` : 'rgba(255,255,255,0.4)' }} title={p.label}>
                  <PlanetIcon planet={key as PlanetColor} size={32} glow={false} />
                  <span className="text-deep-600 mt-0.5">{p.label.split('·')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="pb-8">
          <Button variant="primary" size="lg" className="w-full" onClick={handleSave} isLoading={saving}>保存修改</Button>
        </div>
      </div>
    </div>
  );
}
