'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RemovePage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!url.trim()) {
            setMessage('请输入有效的服务器URL');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`/api/updateJetbrains?url=${encodeURIComponent(url)}&action=delete`);
            const data = await response.json();

            if (data.success) {
                setMessage('删除申请已处理成功，该服务器记录已从研究数据库中移除。');
                setMessageType('success');
                setUrl('');
            } else {
                setMessage(data.message || '删除申请处理失败，请检查URL是否正确');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('网络请求失败，请稍后重试');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg">
                    <div className="px-6 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                服务器删除申请
                            </h1>
                            <p className="text-gray-600">
                                如果您的服务器被误收录到我们的研究数据库中，请使用此表单申请移除
                            </p>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                            <div className="text-blue-800">
                                <h3 className="font-semibold mb-2">📋 申请说明</h3>
                                <ul className="text-sm space-y-1 ml-4">
                                    <li>• 本表单仅用于从研究数据库中移除您的服务器记录</li>
                                    <li>• 删除操作不会影响您的实际服务器，仅移除本平台的记录</li>
                                    <li>• 建议同时检查并加固您的服务器安全配置</li>
                                    <li>• 系统会自动验证URL格式和存在性</li>
                                </ul>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                    服务器URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="例如：http://example.com:8080"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    请输入完整的URL地址，包括协议和端口号
                                </p>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-md ${
                                    messageType === 'success' 
                                        ? 'bg-green-50 border border-green-200 text-green-800' 
                                        : 'bg-red-50 border border-red-200 text-red-800'
                                }`}>
                                    {message}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? '处理中...' : '提交删除申请'}
                                </button>
                                <Link
                                    href="/"
                                    className="flex-1 text-center bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                >
                                    返回首页
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-8 bg-white shadow-lg rounded-lg">
                    <div className="px-6 py-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">🤖 自动清理机制</h2>
                        <div className="text-gray-700 space-y-3">
                            <p>
                                我们的系统配备了智能监控机制，会定期检测所有记录的服务器状态：
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>当服务器修复安全配置后，系统会自动检测到访问限制</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>连续检测失败的服务器会被自动移除</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>无需手动操作，系统会自动维护数据的时效性</span>
                                </li>
                            </ul>
                            <p className="text-sm text-gray-600 mt-4">
                                💡 提示：如果您已修复服务器配置，可等待系统自动清理，通常在24-48小时内完成。
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
                    <p>本平台专注于网络安全研究，严格遵循负责任披露原则</p>
                    <p>
                        开源项目 · MIT许可 · 源码托管于 <a href="https://github.com/asionesjia/jetbrains" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>
                    </p>
                    <p>如有疑问，请通过 <a href="https://github.com/asionesjia/jetbrains/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Issues</a> 联系我们</p>
                </div>
            </div>
        </main>
    );
}