# Welcome to ReactEdge

## 1. Clone the repository

```bash
git clone https://github.com/digitalrisedorset/ready ReactEdge
cd ReactEdge
```

---

## 2. Install Mise

## Project tasks

Mise is used as a task runner. The commands it executes are defined in
`mise.toml`, with supporting scripts in `launcher/scripts/`, and can be
inspected before running them.

| Command | Purpose |
| --- | --- |
| `mise run configure` | Generates the local ReactEdge configuration |
| `mise run widget-dev -- <widget>` | Starts a widget locally with Vite |
| `mise run widget-build -- <widget>` | Builds a selected widget |
| `mise run widgets-deploy` | Builds and deploys selected widget assets |
| `mise run widget-test -- <widget>` | Runs tests for a selected widget |

ReactEdge uses Mise for tool version management and project tasks.

### macOS

```bash
brew install mise
```

### Linux / other platforms

Activate Mise for your shell by following the setup instructions shown after installation, or the official Mise documentation.

```bash
curl https://mise.run | sh
```

Verify:

```bash
mise --version
```

When you first enter the ReactEdge repository, Mise may ask you to trust
the project's mise.toml:
```bash
mise trust
```

You can inspect mise.toml before trusting it.

---

## 3. Install ReactEdge dependencies

Install all project dependencies:

```bash
npm ci
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
- `services/orchestrator/.env.dev`
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
