"use server"
import {Table} from "@/components/table";
import {createClient} from "@/utils/supabase/server";
import CopyButton from "@/components/copy-button";

export type JetBrainsType = {
    availability: number,
    created_at: string,
    id: number,
    updated_at: string,
    url: string | null
}[];

function processJetBrainsData(data: JetBrainsType | null): [string, JetBrainsType | null] {
    if (!data || data.length === 0) {
        return ["", null];
    }

    // 过滤掉 null 的 updated_at 并转换为 Date
    const validDates = data
        .filter(item => item.created_at !== null)
        .map(item => new Date(item.created_at as string));

    // 找到最近的 updated_at
    const latestUpdatedTime = validDates.length > 0
        ? new Date(Math.max(...validDates.map(date => date.getTime() + 8 * 60 * 60 * 1000))).toISOString().replace('T', ' ').split('.')[0]
        : "";


    // 排序函数
    const sortedData = data.slice().sort((a, b) => {
        // 比较 availability
        if (a.availability !== b.availability) {
            return (b.availability || 0) - (a.availability || 0);
        }
        // 如果 availability 相同，比较 created_at
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return [latestUpdatedTime, sortedData];
}


export default async function Home() {
  const supabase = createClient()
  const { data: jetbrains, error } = await supabase
      .from('jetbrains')
      .select('*')


    if(error) {
        return (
            <main className="flex min-h-screen flex-col items-center px-24 py-8">
                <div className="z-10 w-full max-w-5xl items-center font-serif">
                    <p className="fixed w-full px-8 left-0 top-0 flex text-2xl font-bold from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:p-4">
                        网络安全研究：JetBrains许可服务器分析平台
                    </p>
                    <p className="fixed w-full px-8 left-0 top-0 flex text-md font-bold from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:p-4">
                        专注于网络空间暴露的JetBrains许可服务器安全研究，仅供学术研究和教育用途。
                    </p>
                </div>

                <div
                    className="pt-20 flex place-items-center">
                    资源请求失败，请稍后重新尝试。
                </div>
            </main>
        )
    }


    const [latestUpdatedTime, sortedData] = processJetBrainsData(jetbrains);


  return (
      <main className="flex min-h-screen flex-col items-center px-3 sm:px-6 md:px-12 lg:px-16 xl:px-24 py-8">
          <div className="z-10 w-full max-w-5xl items-center justify-between font-serif">
              <div className="w-full px-3 md:px-6 lg:px-8 left-0 top-0 font-bold from-zinc-200 pb-6 pt-8 backdrop-blur-2xl static space-y-4">
                  <p className={'text-3xl'}>网络安全研究：JetBrains许可服务器分析平台</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🔬 学术研究
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          📖 开源项目
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🛡️ 安全研究
                      </span>
                  </div>
                  <p className="text-base pt-2">
                      📊 以下是通过网络空间搜索引擎发现的可能运行JetBrains许可服务的网络节点，专用于网络安全态势分析和学术研究。
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                      🔗 本项目采用MIT开源许可，源码托管于 <a href="https://github.com/asionesjia/jetbrains" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">GitHub</a>，欢迎学术交流与贡献。
                  </p>
                  <div className="text-sm pt-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                      <p className="font-bold text-red-800 mb-2">🛡️ 重要安全提醒</p>
                      <p className="text-red-700 mb-2">
                          如果您的服务器意外出现在此列表中，这表明您的许可服务可能存在网络暴露风险，建议您立即采取以下措施：
                      </p>
                      <div className="text-red-700 ml-4 space-y-1">
                          <p>• 检查并加固服务器安全配置</p>
                          <p>• 限制服务访问权限和网络暴露范围</p>
                          <p>• 如需从本研究平台移除记录，可使用 <a href="/remove" className="underline text-blue-600 hover:text-blue-800">删除申请表单</a></p>
                      </div>
                      <p className="text-red-600 mt-2 text-xs">
                          ℹ️ 系统会定期自动检测服务状态，已修复的安全问题将被自动移除
                      </p>
                  </div>
              </div>

          </div>

          <div
              className="pt-8 place-items-center">
              <Table update_time={latestUpdatedTime} data={sortedData}/>
          </div>
      </main>
  )
}


















