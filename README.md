# Golden Knox Diagnostic

GitHub Pages estático para diagnosticar sinais de Knox Manage diretamente no telefone.

## O que o site consegue fazer

- Identificar Android/Samsung/Samsung Internet pelo `User-Agent`.
- Recolher sinais fornecidos no próprio telefone.
- Cruzar esses sinais com os fluxos oficiais de unenrollment do Knox Manage.
- Tentar abrir o pacote do Knox Manage Agent em navegadores Android que aceitem `intent://`.
- Fornecer fallback para a página do Knox Manage na Google Play.

## O que o site não consegue fazer

Uma página web não pode consultar diretamente:

- `DevicePolicyManager.isDeviceOwnerApp()`;
- `DevicePolicyManager.isProfileOwnerApp()`;
- o estado interno do Knox Manage;
- a política MDM aplicada ao dispositivo.

Essas informações ficam fora do modelo de permissões de uma página web. Por isso, o diagnóstico marca inferências como “provável” em vez de fingir uma leitura que o browser não tem.

## Publicar no GitHub Pages

1. Cria um repositório no GitHub.
2. Copia o conteúdo de `docs/` para a pasta `docs/` do repositório.
3. Em **Settings → Pages**, escolhe **Deploy from a branch**.
4. Seleciona a branch principal e a pasta `/docs`.
5. Abre o endereço GitHub Pages no Galaxy.

O site não necessita de servidor ou backend.

## Fluxos reconhecidos

### Work Profile
Quando o Knox Manage oferece “Remove Work Profile only”, a documentação indica que o perfil pode ser removido sem factory reset.

### Dispositivo conectado
O administrador pode enviar “Unenroll Device”. O Knox Manage também tem uma configuração para permitir pedido de unenrollment pelo próprio utilizador.

### Dispositivo desconectado
O administrador pode gerar um **Offline Unenrollment Code**. No Agent:
**Settings → Offline Unenrollment → código → End**.

### Fully Managed / KME
O unenrollment pode envolver factory reset. Se houver Knox Mobile Enrollment, a situação do perfil KME também deve ser tratada para impedir novo provisionamento automático.

## Referências oficiais

- https://docs.samsungknox.com/admin/knox-manage/configure/devices/unenroll-and-delete-devices/
- https://docs.samsungknox.com/admin/knox-manage/kbas/kba-360036296274/
- https://docs.samsungknox.com/admin/knox-manage/new-console/get-started/configure-general-settings/
- https://docs.github.com/en/pages

## Manutenção

O fluxo de diagnóstico deve ser revisto quando a Samsung alterar as opções de unenrollment, o Agent ou as regras de Android Enterprise.
