"use client"

import CopyButton from "@/components/copy-button";
import {JetBrainsType} from "@/app/page";

interface TableProps {
    update_time: string,
    data: JetBrainsType | null
}
export function Table(props: TableProps) {
    const {update_time, data} = props

    return (
        <>
            <p className={'fixed bottom-0 right-4 pb-6 pt-8 z-50'}>更新时间：{update_time}</p>
            {/*<div className={'w-full flex-col border-b border-gray-300 dark:border-gray-700 pb-6 mb-6'}>*/}
            {/*    <p className={'p-3 text-gray-500'}>固定通用地址，随机转发到下方任一地址,你只需要猛击Active🤡。</p>*/}
            {/*    <div className={'w-full flex items-center justify-center'}>*/}
            {/*        <CopyButton str={'https://jetbrains.asiones.com/api/oneCopy'} id={'187'}/>*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 text-center">
                {
                    !data ? "暂无数据" : data.map(i =>
                        <div className={'w-full flex justify-center items-center'} key={i['url']}>
                            <CopyButton str={i['url'] || ''} id={String(i.id) || ''}/>
                        </div>
                    )
                }
            </div>
        </>
    )

}
