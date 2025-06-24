import { DuckyIndex } from '@/types/ducky'

interface RecentDocumentsProps {
  indexes: DuckyIndex[]
  selectedIndex: string
  setSelectedIndex: (index: string) => void
  setIsSubmitted: (submitted: boolean) => void
  isLoadingIndexes: boolean
  indexError: string | null
}

export function RecentDocuments({
  indexes,
  selectedIndex,
  setSelectedIndex,
  setIsSubmitted,
  isLoadingIndexes,
  indexError
}: Readonly<RecentDocumentsProps>) {
  return (
    <div className="flex h-full flex-col">
      {/* Recent Documents List */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col md:justify-end">
          {isLoadingIndexes ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="h-5 w-5 animate-spin text-[var(--blue)]"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : indexError ? (
            <div className="p-4 text-[var(--red)]">{indexError}</div>
          ) : indexes.length === 0 ? (
            <div className="py-4 text-center text-[var(--gray)]">
              No recent documents
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {indexes.map((index) => (
                <button
                  key={index.index_name}
                  onClick={() => {
                    setSelectedIndex(index.index_name)
                    setIsSubmitted(true)
                  }}
                  className={`cursor-pointer text-left text-[18px] leading-[145%] font-medium transition-colors duration-[240ms] md:text-left ${selectedIndex === index.index_name ? 'text-white' : 'text-[var(--gray)] hover:text-white'}`}
                >
                  {index.index_name === 'tiktok-com' && (
                    <span
                      className="mr-2 inline-block rounded-full bg-[var(--red)] px-[9px] py-[4px] align-middle text-xs font-semibold text-white"
                      style={{ verticalAlign: 'middle' }}
                    >
                      bad
                    </span>
                  )}

                  {index.index_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
