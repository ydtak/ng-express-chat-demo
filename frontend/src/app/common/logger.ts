const DEBUG_LOGGING = true;

export function LOG(level: 'debug' | 'info' | 'warn' | 'error' = 'info', ...message: any[]) {
    if (DEBUG_LOGGING || level !== 'debug') {
        console.log(`[${level}]`, ...message);
    }
}

export function LOG_DEBUG(...message: any[]) {
    LOG('debug', ...message);
}

export function LOG_INFO(...message: any[]) {
    LOG('info', ...message);
}

export function LOG_WARN(...message: any[]) {
    LOG('warn', ...message);
}

export function LOG_ERROR(...message: any[]) {
    LOG('error', ...message);
}
