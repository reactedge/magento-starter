# Welcome to ReactEdge

## 1. Clone the repository

```bash
git clone https://github.com/digitalrisedorset/ready ReactEdge
cd ReactEdge
```

---

## 2. Install mise

```bash
curl https://mise.run | sh
```

Activate it (Bash):

```bash
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
source ~/.bashrc
```

Verify:

```bash
mise --version
```

---

## 3. Install ReactEdge dependencies

Make the helper scripts executable:

```bash
chmod u+x ./launcher/scripts/*.sh
```

Install all project dependencies:

```bash
npm install
```

---

## 4. Configure ReactEdge

```bash
cp .env.sample .env
mkdir -p workspace
cp -R workspace.sample/* workspace/
```

Generate the local configuration:

```bash
mise run configure
```

The configuration wizard will create:

- `.env`
- `deployment-orchestrator/.env.dev`
- `widgets/*/public/reactedge-runtime.json`

---

## 5. Launch a widget locally

For example:

```bash
mise run widget-dev -- productgallery
```

or:

```bash
mise run widget-dev -- megamenu
```

---

# Magento Integration

Change to your Magento or Mage-OS installation directory:

```bash
cd /path/to/magento
```

Update `composer.json`:

```json
"minimum-stability": "dev"
```

Install the ReactEdge bridge:

```bash
composer require reactedge/widgetbridgelight
```

Enable the module:

```bash
bin/magento module:enable ReactEdge_WidgetBridge

bin/magento setup:upgrade

bin/magento cache:flush
```

---

## Verify the installation

Check that the module is installed:

```bash
bin/magento module:status ReactEdge_WidgetBridge
```

Inspect widget configuration:

```bash
bin/magento config:show reactedge/productgallery/enabled
bin/magento config:show reactedge/megamenu/enabled
```

---

## Configure integrations

```

Enable server-side rendering:

```bash
bin/magento config:set reactedge/widgets_ssr/enabled 1
```

---

## Enable widgets

Enable the widgets you want to use:

```bash
bin/magento config:set reactedge/megamenu/enabled 1

bin/magento config:set reactedge/productgallery/enabled 1
```

Flush the cache:

```bash
bin/magento cache:flush
```

---

## Customise widget placement

Copy the starter layout XML files into the active Magento theme and adjust widget placement as required.

---

## Deploy widgets

Build and publish the widgets:

```bash
mise run widgets-deploy
```

### Automatic Magento configuration (Docker only)

When `DOCKER_USED=1` in .env, `widgets-deploy` automatically configures Magento after deployment.

The deployment script will:

- configure the Google Maps API key
- configure the Google Place ID
- enable server-side rendering
- enable the selected widgets
- flush the Magento cache

The default implementation assumes a Docker development environment using the `mageos_php` container.

To disable automatic Magento configuration, set:

```bash
DOCKER_USED=0
```

### Creating a widget with ChatGPT

To scaffold a new widget with ChatGPT, start a fresh conversation and attach:

* `widget-spec.md`
* the shared `packages/widget-build/shared-resources/vite_project` folder as a zip archive

Then use the following prompt:

```text
Create a widget called widget01.

Follow widget-spec.md exactly.
```
