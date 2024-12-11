export type FetchExecutorInit = Partial<{ url: string, logger: Console }> & RequestInit;

export type FetchExecutor<ExecutorInitType, ExecutorResponseType>
    = (req: ExecutorInitType & FetchExecutorInit) => ExecutorResponseType
