# Login to Docker Hub (run this first)
# docker login

# Replace 'yourusername' with your Docker Hub username
$DOCKER_USERNAME = "yourusername"

# Tag images
docker tag green-haven-client:latest ${DOCKER_USERNAME}/green-haven-client:latest
docker tag green-haven-server:latest ${DOCKER_USERNAME}/green-haven-server:latest

# Push to Docker Hub
docker push ${DOCKER_USERNAME}/green-haven-client:latest
docker push ${DOCKER_USERNAME}/green-haven-server:latest

Write-Host "Images pushed successfully!" -ForegroundColor Green
Write-Host "Client: ${DOCKER_USERNAME}/green-haven-client:latest" -ForegroundColor Cyan
Write-Host "Server: ${DOCKER_USERNAME}/green-haven-server:latest" -ForegroundColor Cyan
