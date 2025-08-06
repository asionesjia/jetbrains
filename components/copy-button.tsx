import {useEffect, useRef, useState} from 'react';
import {FiCheck, FiCopy} from 'react-icons/fi';
import './copy-button.css'
import {useTestFetching} from "@/hooks/test-fetching";
import {Progress} from "@/components/progress";
import {useUpdateJetbrains} from "@/hooks/update-jetbrains";

const CopyButton = ({str, id}: { str: string, id: string }) => {
    const [copied, setCopied] = useState(false);
    const [progress, setProgress] = useState(0);
    const {isFetching, status, error} = useTestFetching(str, 8000)

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(42), 500)
        const handleMouseMove = (event: { x: any; y: any; }) => {
            // 更新顶层 div 的样式
            const cardDiv = cardRef.current;
            if(cardDiv) {
                const cardInfo = cardRef.current.getBoundingClientRect()
                const x = event.x - cardInfo.left - 48
                const y = event.y - cardInfo.top - 48
                cardDiv.style.setProperty('--x', `${x}px`);
                cardDiv.style.setProperty('--y', `${y}px`);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(str).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // 2秒后恢复初始状态
        }).catch(err => {
            console.error('复制失败:', err);
        });
    };
    useUpdateJetbrains(id, status)

    return (
        <div className={'w-52 h-12 relative rounded overflow-hidden z-100 before:content-[""] before:h-24 before:w-24 before:rounded-full before:absolute before:z-200 before:inset-0 before:left-0 before:top-0 before:bg-radial-gradient before:translate-x-[var(--x,10000px)] before:translate-y-[var(--y,10000px)]'}
             ref={cardRef}
        >
            <div
                onClick={handleCopy}
                className={'p-2 flex flex-row items-center justify-between space-x-2 cursor-pointer absolute inset-[1px] rounded z-300 bg-gray-100 dark:bg-black scroll-container'}>
                <div
                    className={'max-w-40 overflow-clip hover:overflow-auto'}>
                        {copied ? <span className={'text-indigo-400'}>已复制</span>
                            :
                            <p className={'dark:text-gray-200 transition-all duration-300 scroll-text text-nowrap'}>{str}</p>}
                </div>
                <div></div>
                <div
                    className={'w-6 h-6 rounded flex items-center justify-center text-indigo-400 absolute right-1'}>
                    {copied ?
                        <FiCheck className="w-4 h-4"/>
                        :
                        <FiCopy
                            className="w-4 h-4"/>
                    }
                </div>
            </div>
            <Progress value={isFetching ? progress : 100} type={status === false ? 'danger' : 'default'} className="w-[96%] absolute bottom-[3px] left-[2%] overflow-hidden" />
        </div>
    );
};

export default CopyButton;
