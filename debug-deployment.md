# 部署调试指南

## 问题诊断步骤

### 1. 检查容器是否正常运行
```bash
# SSH 到 ECS 服务器
ssh root@47.115.57.172

# 检查容器状态
docker ps
docker logs web-intro

# 检查容器内部网络
docker exec -it web-intro netstat -tlnp
```

### 2. 检查端口映射
```bash
# 检查宿主机端口监听
netstat -tlnp | grep 3000
# 或者
ss -tlnp | grep 3000
```

### 3. 检查防火墙设置
```bash
# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload

# Ubuntu
sudo ufw status
sudo ufw allow 3000
```

### 4. 检查阿里云安全组
- 登录阿里云控制台
- 找到 ECS 实例的安全组
- 确保 3000 端口的入方向规则已开放

### 5. 测试本地连通性
```bash
# 在 ECS 服务器上测试
curl http://localhost:3000
curl http://127.0.0.1:3000

# 测试容器内部
docker exec -it web-intro curl http://localhost:3000
```

## 常见解决方案

### 方案1：修改端口映射（已修改）
Jenkins 配置已修改为：`-p 3000:3000`

### 方案2：使用 80 端口访问
如果保持原来的 `-p 80:3000` 配置，则通过 `http://47.115.57.172` 访问

### 方案3：检查 Next.js 配置
确保 Next.js 绑定到 0.0.0.0 而不是 localhost
