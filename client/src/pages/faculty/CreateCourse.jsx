import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiUpload, HiPlusCircle, HiTrash, HiPhotograph, HiVideoCamera, HiDocumentText } from 'react-icons/hi';

export default function CreateCourse() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ title: '', description: '', category: '', level: 'Beginner', price: '', thumbnail: null });
    const [modules, setModules] = useState([{ title: '', lessons: [{ title: '', type: 'video' }] }]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const addModule = () => setModules([...modules, { title: '', lessons: [{ title: '', type: 'video' }] }]);
    const addLesson = (modIdx) => {
        const updated = [...modules];
        updated[modIdx].lessons.push({ title: '', type: 'video' });
        setModules(updated);
    };

    const steps = ['Course Details', 'Curriculum', 'Pricing & Publish'];

    return (
        <div className="page-transition space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Create New Course</h1>
                <p className="text-text-secondary text-sm mt-1">Build and publish your course</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                        <button
                            onClick={() => setStep(i + 1)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${step >= i + 1 ? 'gradient-primary text-white shadow-lg' : 'bg-surface-3 text-text-muted'
                                }`}
                        >
                            {i + 1}
                        </button>
                        <span className={`text-sm hidden sm:block ${step >= i + 1 ? 'text-text-primary font-medium' : 'text-text-muted'}`}>{s}</span>
                        {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'gradient-primary' : 'bg-surface-3'}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Details */}
            {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Course Title</label>
                        <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Complete React Masterclass" className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe what students will learn..." className="input-field resize-none" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Category</label>
                            <select name="category" value={form.category} onChange={handleChange} className="input-field">
                                <option value="">Select Category</option>
                                {['Web Development', 'Data Science', 'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Level</label>
                            <select name="level" value={form.level} onChange={handleChange} className="input-field">
                                {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Thumbnail</label>
                        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                            <HiPhotograph className="text-3xl text-text-muted mb-2" />
                            <span className="text-sm text-text-muted">Click to upload thumbnail</span>
                            <input type="file" accept="image/*" className="hidden" />
                        </label>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => setStep(2)} className="btn-primary">Continue →</button>
                    </div>
                </motion.div>
            )}

            {/* Step 2: Curriculum */}
            {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    {modules.map((mod, modIdx) => (
                        <div key={modIdx} className="glass-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">{modIdx + 1}</div>
                                <input
                                    value={mod.title}
                                    onChange={(e) => { const updated = [...modules]; updated[modIdx].title = e.target.value; setModules(updated); }}
                                    placeholder="Module Title"
                                    className="input-field flex-1"
                                />
                                <button onClick={() => setModules(modules.filter((_, i) => i !== modIdx))} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><HiTrash /></button>
                            </div>
                            <div className="space-y-2 pl-11">
                                {mod.lessons.map((lesson, lessonIdx) => (
                                    <div key={lessonIdx} className="flex items-center gap-2">
                                        <select
                                            value={lesson.type}
                                            onChange={(e) => { const updated = [...modules]; updated[modIdx].lessons[lessonIdx].type = e.target.value; setModules(updated); }}
                                            className="input-field !w-32 text-sm"
                                        >
                                            <option value="video">📹 Video</option>
                                            <option value="pdf">📄 PDF</option>
                                            <option value="quiz">❓ Quiz</option>
                                        </select>
                                        <input
                                            value={lesson.title}
                                            onChange={(e) => { const updated = [...modules]; updated[modIdx].lessons[lessonIdx].title = e.target.value; setModules(updated); }}
                                            placeholder="Lesson Title"
                                            className="input-field flex-1 text-sm"
                                        />
                                        <label className="p-2 rounded-lg glass cursor-pointer hover:scale-105 transition-all">
                                            <HiUpload className="text-text-muted text-sm" />
                                            <input type="file" className="hidden" />
                                        </label>
                                    </div>
                                ))}
                                <button onClick={() => addLesson(modIdx)} className="text-sm text-primary-600 hover:underline flex items-center gap-1 mt-2">
                                    <HiPlusCircle /> Add Lesson
                                </button>
                            </div>
                        </div>
                    ))}
                    <button onClick={addModule} className="btn-secondary w-full flex items-center justify-center gap-2">
                        <HiPlusCircle /> Add Module
                    </button>
                    <div className="flex justify-between">
                        <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                        <button onClick={() => setStep(3)} className="btn-primary">Continue →</button>
                    </div>
                </motion.div>
            )}

            {/* Step 3: Pricing */}
            {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Price (₹ INR)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="999" className="input-field !pl-8" />
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-2 dark:bg-surface-3 space-y-2 text-sm">
                        <h3 className="font-semibold text-text-primary">Course Summary</h3>
                        <p className="text-text-muted">Title: <span className="text-text-primary">{form.title || 'Untitled'}</span></p>
                        <p className="text-text-muted">Modules: <span className="text-text-primary">{modules.length}</span></p>
                        <p className="text-text-muted">Lessons: <span className="text-text-primary">{modules.reduce((sum, m) => sum + m.lessons.length, 0)}</span></p>
                        <p className="text-text-muted">Price: <span className="text-text-primary">₹{form.price || '0'}</span></p>
                    </div>
                    <div className="flex justify-between">
                        <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
                        <button className="btn-primary">🚀 Publish Course</button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
