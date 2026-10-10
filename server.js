const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = dev ? 'localhost' : '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// ✅ 性能监控
const requestMetrics = {
  totalRequests: 0,
  slowRequests: 0,
  avgResponseTime: 0,
  maxResponseTime: 0,
}

app.prepare().then(() => {
  const nextServer = createServer((req, res) => {
    const startTime = Date.now()
    const parsedUrl = parse(req.url, true)

    // A conditional request during ISR revalidation was cached as 304 and then
    // served with an empty body. Always send the rendered page.
    delete req.headers['if-none-match']
    delete req.headers['if-modified-since']

    // ✅ 响应优化 - 添加性能相关的头部
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('X-XSS-Protection', '1; mode=block')

    // ✅ 监听响应完成
    const originalEnd = res.end.bind(res)
    res.end = function(...args) {
      const duration = Date.now() - startTime
      requestMetrics.totalRequests++
      requestMetrics.avgResponseTime = 
        (requestMetrics.avgResponseTime * (requestMetrics.totalRequests - 1) + duration) / requestMetrics.totalRequests
      
      if (duration > requestMetrics.maxResponseTime) {
        requestMetrics.maxResponseTime = duration
      }

      // ⚠️ 记录缓慢请求
      if (duration > 1000) {
        requestMetrics.slowRequests++
        if (process.env.NODE_ENV === 'production') {
          console.warn(`[SLOW] ${req.method} ${req.url} took ${duration}ms`)
        }
      }

      // 定期输出性能统计
      if (requestMetrics.totalRequests % 100 === 0) {
        console.log(`[PERF] Avg: ${requestMetrics.avgResponseTime.toFixed(2)}ms, Max: ${requestMetrics.maxResponseTime}ms, Slow: ${requestMetrics.slowRequests}/${requestMetrics.totalRequests}`)
      }

      return originalEnd(...args)
    }

    handle(req, res, parsedUrl)
  })

  // ✅ 服务器连接管理
  nextServer.maxConnections = 1000
  nextServer.timeout = 30000 // 30 秒超时
  
  nextServer.listen(port, hostname, () => {
    console.log(`> Server ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`)
  })

  // ✅ 优雅关闭
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...')
    nextServer.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })
})
