import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/Button'
import Input from '../../../shared/components/Input'
import Select from '../../../shared/components/ui/Select'
import Avatar from '../../../shared/components/ui/Avatar'
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Clock, 
  Hash, 
  Sparkles, 
  Send, 
  Save, 
  Check, 
  CheckCircle2, 
  ArrowLeft,
  Eye,
  Globe,
  Share2
} from 'lucide-react'

const availablePlatforms = [
  { id: 'instagram', name: 'Instagram', icon: '📸', defaultSelected: true },
  { id: 'youtube', name: 'YouTube Shorts', icon: '▶️', defaultSelected: true },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', defaultSelected: false },
  { id: 'facebook', name: 'Facebook', icon: '📘', defaultSelected: false },
  { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', defaultSelected: false },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', defaultSelected: false },
]

const suggestedHashtags = [
  '#OrbitSocial', '#ContentCreator', '#TechReviews', '#ViteReact', '#Frontend', '#DesignSystem', '#Productivity'
]

export default function CreatePost() {
  const navigate = useNavigate()

  // Form State (Backend Integration Ready)
  const [caption, setCaption] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'youtube'])
  const [scheduleDate, setScheduleDate] = useState('2026-07-26')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [hashtags, setHashtags] = useState('#OrbitSocial #ContentCreator')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null)
  const [visibility, setVisibility] = useState('Public')

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Handlers
  const handleTogglePlatform = (id) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleAddHashtag = (tag) => {
    if (!hashtags.includes(tag)) {
      setHashtags(prev => (prev ? `${prev} ${tag}` : tag))
    }
  }

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      setMediaPreviewUrl(URL.createObjectURL(file))
      showToast(`Selected file: ${file.name}`)
    }
  }

  const handleSaveDraft = () => {
    showToast('Draft saved successfully!')
    setTimeout(() => navigate('/dashboard/creator/my-posts'), 1000)
  }

  const handleSchedulePost = () => {
    showToast(`Post scheduled for ${scheduleDate} at ${scheduleTime}!`)
    setTimeout(() => navigate('/dashboard/creator/content-scheduling'), 1000)
  }

  const handlePublishNow = () => {
    showToast('Publishing post across selected platforms...')
    setTimeout(() => navigate('/dashboard/creator/my-posts'), 1000)
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-16">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-slide-up">
          <Sparkles size={16} className="text-indigo-400 dark:text-indigo-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section aria-label="Page header" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create New Post</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-sm font-medium">Compose, schedule, and publish content across your social channels.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="md" onClick={handleSaveDraft}>
              <Save size={16} />
              <span>Save Draft</span>
            </Button>
            <Button variant="primary" size="md" onClick={handleSchedulePost}>
              <Calendar size={16} />
              <span>Schedule Post</span>
            </Button>
            <Button variant="primary" size="md" onClick={handlePublishNow} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Send size={16} />
              <span>Publish Now</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Grid: Composer Form (Left) & Preview Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Left Column — Editor & Configuration */}
        <div className="space-y-6">
          {/* SECTION: Platform Selector */}
          <Card className="p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe size={18} className="text-indigo-500" />
                <span>Select Target Platforms</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose where this content will be published simultaneously.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availablePlatforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id)
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handleTogglePlatform(platform.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{platform.icon}</span>
                      <span className="text-xs">{platform.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-indigo-500 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </Card>

          {/* SECTION: Media Upload Dropzone Placeholder */}
          <Card className="p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload size={18} className="text-indigo-500" />
                <span>Upload Media Assets</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Drag and drop images, video clips, or infographics (JPG, PNG, MP4 up to 500MB).</p>
            </div>

            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-400 transition-colors group cursor-pointer">
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={handleMediaUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to upload <span className="text-slate-400 font-normal">or drag & drop</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium pt-1">
                  <span className="flex items-center gap-1"><ImageIcon size={14} /> Images</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Video size={14} /> Reels & Short Videos</span>
                </div>
              </div>
            </div>

            {mediaPreviewUrl && (
              <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={mediaPreviewUrl} alt="Preview thumbnail" className="w-12 h-12 object-cover rounded-lg" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">{mediaFile?.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{(mediaFile?.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setMediaFile(null); setMediaPreviewUrl(null); }}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </Card>

          {/* SECTION: Caption Editor */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-500" />
                  <span>Caption & Body Copy</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Write your post caption, call to action, and main story.</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">{caption.length} / 2,200 chars</span>
            </div>

            <div className="space-y-2">
              <textarea 
                rows={5} 
                className="input-base text-sm" 
                value={caption} 
                onChange={(e) => setCaption(e.target.value)} 
                placeholder="Write your main caption here... Add emojis, tag accounts, and detail your post updates." 
              />
            </div>
          </Card>

          {/* SECTION: Hashtag Section */}
          <Card className="p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Hash size={18} className="text-indigo-500" />
                <span>Hashtags & Tags</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add relevant tags to improve algorithmic discovery and reach.</p>
            </div>

            <Input 
              label="Hashtags" 
              value={hashtags} 
              onChange={(e) => setHashtags(e.target.value)} 
              placeholder="#OrbitSocial #TechReview" 
            />

            <div className="space-y-1.5 pt-1">
              <label className="label-base">Suggested Trending Hashtags</label>
              <div className="flex flex-wrap gap-1.5">
                {suggestedHashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddHashtag(tag)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* SECTION: Schedule Date & Time */}
          <Card className="p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock size={18} className="text-indigo-500" />
                <span>Schedule & Visibility</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Set the automatic publish date and time window.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                label="Schedule Date" 
                type="date" 
                value={scheduleDate} 
                onChange={(e) => setScheduleDate(e.target.value)} 
              />
              <Input 
                label="Schedule Time" 
                type="time" 
                value={scheduleTime} 
                onChange={(e) => setScheduleTime(e.target.value)} 
              />
              <Select 
                label="Visibility" 
                value={visibility} 
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="Public">Public</option>
                <option value="Draft">Draft</option>
                <option value="Private / Review Only">Private / Review Only</option>
              </Select>
            </div>
          </Card>
        </div>

        {/* Right Column — Live Preview Panel */}
        <div className="space-y-6 sticky top-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Eye size={16} className="text-indigo-500" />
                <span>Live Post Preview</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            {/* Mobile / Social Card Preview Shell */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card overflow-hidden space-y-3 p-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar initials="AC" size="sm" className="ring-2 ring-indigo-500/20" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">Alex Creator</p>
                    <p className="text-[10px] text-slate-400">@alex_creator • Just now</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {selectedPlatforms.map(pId => {
                    const pObj = availablePlatforms.find(p => p.id === pId)
                    return pObj ? <span key={pId} className="text-sm" title={pObj.name}>{pObj.icon}</span> : null
                  })}
                </div>
              </div>

              {/* Media Preview */}
              {mediaPreviewUrl ? (
                <div className="rounded-xl overflow-hidden max-h-56 bg-slate-900">
                  <img src={mediaPreviewUrl} alt="Post preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 rounded-xl bg-slate-100 dark:bg-slate-700/40 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <ImageIcon size={24} className="mb-1" />
                  <span>Media Preview Placeholder</span>
                </div>
              )}

              {/* Caption Preview */}
              <div className="space-y-1 text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                <p className="line-clamp-4">{caption || 'Your caption will appear here as you type in the editor...'}</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold">{hashtags}</p>
              </div>

              {/* Preview Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-slate-400 text-[11px]">
                <span>💬 0 comments</span>
                <span>❤️ 0 likes</span>
                <span className="flex items-center gap-1"><Share2 size={12} /> Share</span>
              </div>
            </div>

            {/* Actions Summary Card */}
            <div className="space-y-2 pt-2">
              <Button variant="primary" size="md" fullWidth onClick={handleSchedulePost}>
                <Calendar size={16} />
                <span>Confirm & Schedule Post</span>
              </Button>
              <Button variant="outline" size="md" fullWidth onClick={handleSaveDraft}>
                <Save size={16} />
                <span>Save to Drafts</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
