HOST_IP=$(ipconfig getifaddr en0)

if [ $(cat .env | grep HOST_IP) ]
then
  sed -i '' -e "s/^HOST_IP=.*/HOST_IP=\"$HOST_IP\"/" .env
  echo "Updated IP in env"
else
  printf >> ./.env "\nHOST_IP=\"$HOST_IP\""
  echo "Add IP to env"
fi
