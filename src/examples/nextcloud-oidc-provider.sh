CT=$(docker ps -q -f label=vps.app=my-nextcloud -f label=vps.component=app | head -1)

docker exec --user 33 "$CT" php /var/www/html/occ app:enable user_oidc

docker exec --user 33 "$CT" php /var/www/html/occ user_oidc:provider keycloak \
  --no-interaction \
  --clientid="<client-id>" \
  --clientsecret="<client-secret>" \
  --discoveryuri="https://auth.yourdomain.com/realms/vps/.well-known/openid-configuration" \
  --scope="openid email profile groups" \
  --mapping-uid=preferred_username \
  --mapping-display-name=name \
  --mapping-email=email \
  --mapping-groups=groups \
  --group-provisioning=1
