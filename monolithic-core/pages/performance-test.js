import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaUsers, FaServer, FaClock, FaExclamationTriangle } from 'react-icons/fa';

export default function PerformanceTest() {
    const router = useRouter();
    const [userCount, setUserCount] = useState(100);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [chartScript, setChartScript] = useState('');

    // Check authentication on load
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Bạn cần đăng nhập để sử dụng tính năng này');
            router.push('/login');
            return;
        }

        // Set token in cookies for API authentication
        document.cookie = `authToken=${token}; path=/; max-age=3600;`;
    }, [router]);

    // Load Chart.js dynamically on client-side
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            setChartScript('loaded');
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Render charts when results and Chart.js are available
    useEffect(() => {
        if (chartScript === 'loaded' && results) {
            renderCharts();
        }
    }, [chartScript, results]);

    const renderCharts = () => {
        // Destroy existing charts if they exist
        const existingCharts = window.myCharts || [];
        existingCharts.forEach(chart => chart.destroy());
        window.myCharts = [];

        // Response Time Chart
        const responseTimeCtx = document.getElementById('responseTimeChart');
        if (responseTimeCtx) {
            const responseTimeChart = new window.Chart(responseTimeCtx, {
                type: 'line',
                data: {
                    labels: results.responseTimeLabels,
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: results.responseTimeSeries,
                        borderColor: '#0077b6',
                        backgroundColor: 'rgba(0, 119, 182, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Time (ms)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Request Number'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Response Time Per Request'
                        }
                    }
                }
            });
            window.myCharts.push(responseTimeChart);
        }

        // Error Rate Chart
        const errorRateCtx = document.getElementById('errorRateChart');
        if (errorRateCtx) {
            const errorRateChart = new window.Chart(errorRateCtx, {
                type: 'pie',
                data: {
                    labels: ['Successful', 'Failed'],
                    datasets: [{
                        data: [results.successRate, 100 - results.successRate],
                        backgroundColor: ['#00b4d8', '#ef476f']
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Request Success Rate (%)'
                        }
                    }
                }
            });
            window.myCharts.push(errorRateChart);
        }

        // CPU Usage Chart
        const cpuUsageCtx = document.getElementById('cpuUsageChart');
        if (cpuUsageCtx) {
            const cpuUsageChart = new window.Chart(cpuUsageCtx, {
                type: 'bar',
                data: {
                    labels: ['Idle', 'CPU Usage'],
                    datasets: [{
                        label: 'CPU Utilization (%)',
                        data: [100 - results.cpuUsage, results.cpuUsage],
                        backgroundColor: ['#90e0ef', '#0077b6']
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Percentage (%)'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Server CPU Usage'
                        }
                    }
                }
            });
            window.myCharts.push(cpuUsageChart);
        }

        // Memory Usage Chart
        const memoryUsageCtx = document.getElementById('memoryUsageChart');
        if (memoryUsageCtx) {
            const memoryUsageChart = new window.Chart(memoryUsageCtx, {
                type: 'bar',
                data: {
                    labels: ['Free', 'Used'],
                    datasets: [{
                        label: 'Memory Usage (MB)',
                        data: [results.totalMemory - results.usedMemory, results.usedMemory],
                        backgroundColor: ['#90e0ef', '#0077b6']
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Memory (MB)'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Server Memory Usage'
                        }
                    }
                }
            });
            window.myCharts.push(memoryUsageChart);
        }
    };

    const runPerformanceTest = async () => {
        if (userCount < 1) {
            toast.error('Số người dùng phải lớn hơn 0');
            return;
        }

        if (userCount > 5000) {
            toast.error('Để bảo vệ hệ thống, số người dùng tối đa là 5000');
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const response = await fetch('/api/performance-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userCount }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi chạy kiểm tra hiệu năng');
            }

            const data = await response.json();
            setResults(data);

            // Show overall assessment
            if (data.averageResponseTime < 200) {
                toast.success('Hiệu năng tuyệt vời! Thời gian phản hồi rất nhanh.');
            } else if (data.averageResponseTime < 500) {
                toast.success('Hiệu năng tốt. Hệ thống đáp ứng nhanh.');
            } else if (data.averageResponseTime < 1000) {
                toast.custom((t) => (
                    <div className="px-6 py-4 bg-yellow-600 rounded-lg shadow-md">
                        <p className="text-white">Hiệu năng chấp nhận được, nhưng có thể cải thiện.</p>
                    </div>
                ));
            } else {
                toast.error('Hiệu năng kém. Nên xem xét tối ưu hóa hệ thống.');
            }
        } catch (error) {
            console.error('Test performance error:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>TaskRiser - Kiểm tra hiệu năng</title>
            </Head>
            <div className="min-h-screen bg-[#caf0f8] text-[#03045e] font-['Orbitron',_sans-serif]">
                <main className="max-w-7xl mx-auto py-8 px-4">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-[#0077b6] hover:text-[#00b4d8] transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Quay lại
                        </button>
                    </div>

                    <div className="bg-[#ade8f4] p-5 rounded-xl shadow-xl border border-[#48cae4]/40 mb-6">
                        <h1 className="text-2xl font-bold mb-6 text-[#0077b6] border-b-2 border-[#00b4d8]/20 pb-2">KIỂM TRA HIỆU NĂNG HỆ THỐNG</h1>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-[#0077b6] mb-1.5 flex items-center">
                                <FaUsers className="mr-2 text-[#00b4d8]" /> Số lượng người dùng truy cập đồng thời
                            </label>
                            <div className="flex space-x-4">
                                <input
                                    type="number"
                                    value={userCount}
                                    onChange={(e) => setUserCount(parseInt(e.target.value) || 0)}
                                    min="1"
                                    max="5000"
                                    className="w-full md:w-1/3 px-4 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef]/60 rounded-lg shadow-sm placeholder-[#48cae4]/60 text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors"
                                />
                                <button
                                    onClick={runPerformanceTest}
                                    disabled={loading}
                                    className="flex items-center justify-center py-2.5 px-6 rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#0096c7] hover:to-[#48cae4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b4d8] focus:ring-offset-[#caf0f8] disabled:opacity-50 transition-all"
                                >
                                    {loading ? 'Đang chạy kiểm tra...' : 'Bắt đầu kiểm tra'}
                                </button>
                            </div>
                        </div>

                        {loading && (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0077b6]"></div>
                                <p className="mt-2 text-[#0077b6]">Đang mô phỏng {userCount} người dùng truy cập...</p>
                            </div>
                        )}

                        {results && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-[#caf0f8] p-4 rounded-lg shadow border border-[#90e0ef]">
                                        <div className="flex items-center">
                                            <FaClock className="text-[#0077b6] mr-2" />
                                            <h3 className="text-sm font-semibold text-[#03045e]">Thời gian phản hồi trung bình</h3>
                                        </div>
                                        <p className="mt-2 text-xl font-bold text-[#0077b6]">{results.averageResponseTime} ms</p>
                                    </div>
                                    <div className="bg-[#caf0f8] p-4 rounded-lg shadow border border-[#90e0ef]">
                                        <div className="flex items-center">
                                            <FaServer className="text-[#0077b6] mr-2" />
                                            <h3 className="text-sm font-semibold text-[#03045e]">Tỉ lệ thành công</h3>
                                        </div>
                                        <p className="mt-2 text-xl font-bold text-[#0077b6]">{results.successRate}%</p>
                                    </div>
                                    <div className="bg-[#caf0f8] p-4 rounded-lg shadow border border-[#90e0ef]">
                                        <div className="flex items-center">
                                            <FaExclamationTriangle className="text-[#0077b6] mr-2" />
                                            <h3 className="text-sm font-semibold text-[#03045e]">Số lỗi</h3>
                                        </div>
                                        <p className="mt-2 text-xl font-bold text-[#0077b6]">{results.errorCount}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <canvas id="responseTimeChart" height="200"></canvas>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <canvas id="errorRateChart" height="200"></canvas>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <canvas id="cpuUsageChart" height="200"></canvas>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <canvas id="memoryUsageChart" height="200"></canvas>
                                    </div>
                                </div>

                                <div className="bg-[#caf0f8] p-4 rounded-lg shadow border border-[#90e0ef]">
                                    <h3 className="font-semibold text-[#0077b6] mb-2">Đánh giá hiệu năng</h3>
                                    <p className="text-[#03045e]">
                                        {results.averageResponseTime < 200 ? (
                                            <span className="text-green-600 font-medium">Tuyệt vời! Hệ thống có khả năng xử lý tải cao mà không có vấn đề.</span>
                                        ) : results.averageResponseTime < 500 ? (
                                            <span className="text-green-600 font-medium">Tốt. Hệ thống đáp ứng tốt với tải được kiểm tra.</span>
                                        ) : results.averageResponseTime < 1000 ? (
                                            <span className="text-yellow-600 font-medium">Chấp nhận được nhưng có thể cải thiện. Có thể xuất hiện độ trễ trong giờ cao điểm.</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">Kém. Cần xem xét tối ưu hóa và nâng cấp hệ thống.</span>
                                        )}
                                    </p>
                                    <div className="mt-2 space-y-1 text-sm">
                                        <p><strong>CPU:</strong> {results.cpuUsage}% ({results.cpuUsage < 70 ? 'Tốt' : 'Cao'})</p>
                                        <p><strong>Bộ nhớ:</strong> {results.usedMemory}MB / {results.totalMemory}MB</p>
                                        <p><strong>Thời gian phản hồi tối đa:</strong> {results.maxResponseTime}ms</p>
                                        <p><strong>Thời gian phản hồi tối thiểu:</strong> {results.minResponseTime}ms</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
} 