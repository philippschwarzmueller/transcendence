

# get_ip_linux() {
#   hostname -I | awk '{print $1}'
# }

# get_ip_mac() {
#   ipconfig getifaddr en0
# }

# replace_mac() {
#   sed -i '' -e "s/^HOST_IP=.*/HOST_IP=\"$1\"/" .env
# }

# replace_linux() {
#   sed -i -e "s/^HOST_IP=.*/HOST_IP=\"$1\"/" .env
# }

# main() {
# unamestr=$(uname)
# if [ "$unamestr" = 'Linux' ]; then
#   HOST_IP=$(get_ip_linux)
#   if [ $(cat .env | grep HOST_IP) ]; then
#     replace_linux $HOST_IP
#     echo "Updated IP in env"
#   else
#     printf >> ./.env "\nHOST_IP=\"$HOST_IP\""
#     echo "Add IP to env"
#   fi
# else
#   HOST_IP=$(get_ip_mac)
#   if [ $(cat .env | grep HOST_IP) ]; then
#     replace_mac $HOST_IP
#     echo "Updated IP in env"
#   else
#     printf >> ./.env "\nHOST_IP=\"$HOST_IP\""
#     echo "Add IP to env"
#   fi
# fi
# }


# main