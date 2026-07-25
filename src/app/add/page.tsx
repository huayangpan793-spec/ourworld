'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Image as ImageIcon, X, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMemoryStore } from '@/lib/store';
import { MAX_PHOTOS, DEFAULT_TAGS, MEMORY_TYPES, PLANET_COLORS, PlanetColor, MemoryType, Importance, DEFAULT_PLANET_COLOR } from '@/lib/types';
import { PlanetIcon } from '@/components/ui/PlanetIcon';
import { reverseGeocode, searchLocation } from '@/lib/geocode';
import { compressImage } from '@/lib/utils';

export default function AddMemoryPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
        <div className="text-deep-400 font-[family-name:var(--font-body)]">加载中...</div>
      </div>
    }>
      <AddMemoryContent />
    </Suspense>
  );
}

function AddMemoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addMemory = useMemoryStore((s) => s.addMemory);
  const showToast = useMemoryStore((s) => s.showToast);

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  // Form state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('花');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState(latParam ? parseFloat(latParam) : 0);
  const [longitude, setLongitude] = useState(lngParam ? parseFloat(lngParam) : 0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [importance, setImportance] = useState<Importance>(2);
  const [memoryType, setMemoryType] = useState<MemoryType>('travel');
  const [anniversary, setAnniversary] = useState(false);
  const [visitedStatus, setVisitedStatus] = useState<'visited' | 'future'>('visited');
  const [planetColor, setPlanetColor] = useState<PlanetColor>(DEFAULT_PLANET_COLOR);

  // UI state
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; name: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Load geocode on mount if lat/lng provided
  useEffect(() => {
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      setLatitude(lat);
      setLongitude(lng);
      reverseGeocode(lat, lng).then((result) => {
        if (result) {
          setLocationName(result.displayName.split(',')[0] || result.displayName);
          setCity(result.city);
          setCountry(result.country);
        }
      });
    }
  }, [latParam, lngParam]);

  // Location search
  const handleLocationSearch = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const results = await searchLocation(query);
    setSearchResults(results);
    setSearching(false);
  }, []);

  // Photo handling — upload to Supabase Storage
  const handlePhotoAdd = useCallback(async (files: FileList | File[]) => {
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

    const validPreviews = previews.filter(Boolean) as string[];
    setPhotos((prev) => [...prev, ...validPreviews]);
    setPhotoCaptions((prev) => [...prev, ...validPreviews.map(() => '')]);
    setDirty(true);

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
  }, [photos.length]);

  const handlePhotoRemove = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoCaptions((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  }, []);

  const handlePhotoMove = useCallback((from: number, to: number) => {
    const newPhotos = [...photos];
    const newCaptions = [...photoCaptions];
    const [p] = newPhotos.splice(from, 1);
    const [c] = newCaptions.splice(from, 1);
    newPhotos.splice(to, 0, p);
    newCaptions.splice(to, 0, c);
    setPhotos(newPhotos);
    setPhotoCaptions(newCaptions);
  }, [photos, photoCaptions]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handlePhotoAdd(e.dataTransfer.files);
    }
  }, [handlePhotoAdd]);

  // Tag handling
  const handleAddTag = useCallback((tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setCustomTag('');
  }, [tags]);

  // Save
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      showToast('请给这段记忆取一个名字');
      return;
    }
    if (!locationName.trim()) {
      showToast('请选择一个地点');
      return;
    }
    if (!date) {
      showToast('请选择日期');
      return;
    }

    setSaving(true);

    try {
      addMemory({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        author: author.trim(),
        date,
        time: time || undefined,
        locationName: locationName.trim(),
        city: city || undefined,
        country: country || undefined,
        latitude,
        longitude,
        photos,
        coverPhoto: photos[0] || '',
        photoCaptions,
        tags,
        importance,
        memoryType,
        visitedStatus,
        anniversary,
        color: planetColor,
        music: undefined,
        voiceRecord: undefined,
        unlockDate: undefined,
        isHidden: false,
      });

      // Trigger sync to cloud
      const { syncToSupabase } = useMemoryStore.getState();
      syncToSupabase();
      showToast('这段记忆已经被好好收下。');
      router.push('/globe');
    } catch {
      showToast('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }, [title, summary, content, author, date, time, locationName, city, country,
      latitude, longitude, photos, photoCaptions, tags, importance, memoryType,
      visitedStatus, anniversary, addMemory, showToast, router]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (dirty) {
      const timer = setTimeout(() => {
        localStorage.setItem('memory-planet-draft', JSON.stringify({
          title, summary, content, author, date, time, locationName, city, country,
          latitude, longitude, tags, importance, memoryType, anniversary, visitedStatus,
        }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dirty, title, summary, content, author, date, time, locationName, city, country,
      latitude, longitude, tags, importance, memoryType, anniversary, visitedStatus]);

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/40 backdrop-blur-md border-b border-sky-200/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-[family-name:var(--font-title)] text-deep-700 flex-1">
            记录一段新记忆
          </h1>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={saving}
          >
            保存
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Location */}
        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5">
          <h2 className="text-sm font-medium text-deep-700 mb-3 flex items-center gap-2">
            <MapPin size={14} className="text-sky-400" />
            地点
          </h2>

          {/* Map coordinates */}
          {latitude !== 0 && longitude !== 0 && (
            <div className="text-xs text-deep-400 mb-3 font-mono">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </div>
          )}

          {/* Location name */}
          <input
            type="text"
            value={locationName}
            onChange={(e) => { setLocationName(e.target.value); setDirty(true); }}
            placeholder="搜索或输入地点名称"
            className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 placeholder-deep-300 outline-none focus:border-sky-400/50 focus:bg-white/80 transition-all"
          />

          {/* City / Country */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setDirty(true); }}
              placeholder="城市"
              className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2 text-sm text-deep-700 placeholder-deep-300 outline-none focus:border-sky-400/50 transition-all"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => { setCountry(e.target.value); setDirty(true); }}
              placeholder="国家"
              className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2 text-sm text-deep-700 placeholder-deep-300 outline-none focus:border-sky-400/50 transition-all"
            />
          </div>

          {/* Lat/Lng inputs */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-[10px] text-deep-400 mb-1 block">纬度</label>
              <input
                type="number"
                value={latitude}
                onChange={(e) => { setLatitude(parseFloat(e.target.value) || 0); setDirty(true); }}
                step="0.0001"
                className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-deep-400 mb-1 block">经度</label>
              <input
                type="number"
                value={longitude}
                onChange={(e) => { setLongitude(parseFloat(e.target.value) || 0); setDirty(true); }}
                step="0.0001"
                className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Date */}
        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5">
          <h2 className="text-sm font-medium text-deep-700 mb-3">日期与时间</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setDirty(true); }}
              className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => { setTime(e.target.value); setDirty(true); }}
              className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all"
            />
          </div>
        </section>

        {/* Title & Summary & Content */}
        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5 space-y-4">
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">记忆标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
              placeholder="给这段记忆取一个名字"
              className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 placeholder-deep-300 outline-none focus:border-sky-400/50 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">一句话摘要</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => { setSummary(e.target.value); setDirty(true); }}
              placeholder="用一句话记住这一刻"
              className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 placeholder-deep-300 outline-none focus:border-sky-400/50 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">故事正文</label>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setDirty(true); }}
              placeholder="写下当时的心情、发生的事情、想对彼此说的话…"
              rows={6}
              className="w-full bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 placeholder-deep-300 outline-none focus:border-sky-400/50 transition-all resize-none font-[family-name:var(--font-body)] leading-relaxed"
            />
          </div>

          {/* Author */}
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">记录者</label>
            <select
              value={author}
              onChange={(e) => { setAuthor(e.target.value); setDirty(true); }}
              className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all"
            >
              <option value="花">花</option>
              <option value="灵">灵</option>
            </select>
          </div>
        </section>

        {/* Photos */}
        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5">
          <h2 className="text-sm font-medium text-deep-700 mb-3 flex items-center gap-2">
            <ImageIcon size={14} className="text-sky-400" />
            照片
            <span className="text-[10px] text-deep-400 font-normal">
              （最多 {MAX_PHOTOS} 张，当前 {photos.length} 张）
            </span>
          </h2>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-sky-50">
                  <img
                    src={photo}
                    alt={`照片 ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  {/* Caption */}
                  <input
                    type="text"
                    value={photoCaptions[i] || ''}
                    onChange={(e) => {
                      const newCaptions = [...photoCaptions];
                      newCaptions[i] = e.target.value;
                      setPhotoCaptions(newCaptions);
                    }}
                    placeholder="添加说明…"
                    className="absolute bottom-0 inset-x-0 bg-white/70 backdrop-blur-sm text-[10px] px-1.5 py-1 text-deep-500 outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  {/* Remove */}
                  <button
                    onClick={() => handlePhotoRemove(i)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-white/60 text-deep-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="删除照片"
                  >
                    <X size={12} />
                  </button>
                  {/* Index */}
                  <span className="absolute top-1 left-1 text-[10px] text-white/60 bg-black/20 rounded px-1">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          {photos.length < MAX_PHOTOS && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-sky-400 bg-sky-50/30'
                  : 'border-sky-200/30 hover:border-sky-300/40 hover:bg-white/30'
              }`}
            >
              <ImageIcon size={24} className="mx-auto text-deep-300 mb-2" />
              <p className="text-xs text-deep-400 font-[family-name:var(--font-body)]">
                点击或拖拽上传照片
              </p>
              <p className="text-[10px] text-deep-300 mt-1">
                JPG / PNG，建议尺寸 1200px 以内
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handlePhotoAdd(e.target.files)}
          />
        </section>

        {/* Tags */}
        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5">
          <h2 className="text-sm font-medium text-deep-700 mb-3">标签</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {DEFAULT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (tags.includes(tag)) {
                    setTags((prev) => prev.filter((t) => t !== tag));
                  } else {
                    setTags((prev) => [...prev, tag]);
                  }
                  setDirty(true);
                }}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  tags.includes(tag)
                    ? 'bg-sky-100/60 border-sky-300/40 text-sky-600'
                    : 'bg-white/40 border-sky-200/20 text-deep-400 hover:border-sky-200/40'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Custom tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(customTag.trim());
                }
              }}
              placeholder="自定义标签…"
              className="flex-1 bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2 text-sm text-deep-700 placeholder-deep-300 outline-none focus:border-sky-400/50 transition-all"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAddTag(customTag.trim())}
            >
              添加
            </Button>
          </div>

          {/* Selected tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-sky-100/40 text-deep-500"
                >
                  {tag}
                  <button
                    onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                    className="hover:text-red-400"
                    aria-label={`移除标签 ${tag}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Settings */}
        <section className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5 space-y-4">
          <h2 className="text-sm font-medium text-deep-700 mb-3">更多设置</h2>

          {/* Memory type */}
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">记忆类型</label>
            <select
              value={memoryType}
              onChange={(e) => { setMemoryType(e.target.value as MemoryType); setDirty(true); }}
              className="bg-white/60 border border-sky-200/30 rounded-xl px-4 py-2.5 text-sm text-deep-700 outline-none focus:border-sky-400/50 transition-all w-full"
            >
              {MEMORY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Importance */}
          <div>
            <label className="text-xs text-deep-400 mb-1.5 block">重要程度</label>
            <div className="flex gap-2">
              {([1, 2, 3] as Importance[]).map((level) => (
                <button
                  key={level}
                  onClick={() => { setImportance(level); setDirty(true); }}
                  className={`flex-1 py-2 rounded-xl text-xs border transition-all ${
                    importance === level
                      ? 'bg-gold-100/40 border-gold-300/40 text-deep-700'
                      : 'bg-white/40 border-sky-200/20 text-deep-400 hover:border-sky-200/40'
                  }`}
                >
                  {level === 1 ? '普通' : level === 2 ? '重要' : '特别重要'}
                </button>
              ))}
            </div>
          </div>

          {/* 行星色彩 */}
          <div>
            <label className="text-xs text-deep-400 mb-2 block">记忆色彩</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(PLANET_COLORS) as [PlanetColor, typeof PLANET_COLORS[PlanetColor]][]).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => { setPlanetColor(key); setDirty(true); }}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-xs transition-all"
                  style={{
                    borderColor: planetColor === key ? p.hex : 'rgba(158,203,227,0.2)',
                    background: planetColor === key ? `${p.hex}20` : 'rgba(255,255,255,0.4)',
                  }}
                  title={p.label}
                >
                  <PlanetIcon planet={key as PlanetColor} size={32} glow={false} />
                  <span className="text-deep-600 mt-0.5">{p.label.split('·')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-deep-400">标记为纪念日</label>
            <button
              onClick={() => { setAnniversary(!anniversary); setDirty(true); }}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                anniversary ? 'bg-gold-300' : 'bg-sky-200/40'
              }`}
              aria-label="标记为纪念日"
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                anniversary ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-deep-400">状态</label>
            <div className="flex gap-2">
              <button
                onClick={() => { setVisitedStatus('visited'); setDirty(true); }}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  visitedStatus === 'visited'
                    ? 'bg-sky-100/40 border-sky-300/40 text-deep-700'
                    : 'bg-white/40 border-sky-200/20 text-deep-400'
                }`}
              >
                已经去过
              </button>
              <button
                onClick={() => { setVisitedStatus('future'); setDirty(true); }}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  visitedStatus === 'future'
                    ? 'bg-sky-100/40 border-sky-300/40 text-deep-700'
                    : 'bg-white/40 border-sky-200/20 text-deep-400'
                }`}
              >
                未来想去
              </button>
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="pb-8">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSave}
            isLoading={saving}
          >
            保存这段记忆
          </Button>
        </div>
      </div>
    </div>
  );
}
