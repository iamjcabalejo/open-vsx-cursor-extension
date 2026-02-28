# MCP Servers Included

This plugin includes 3 pre-configured MCP servers that enhance Cursor's capabilities.

## Included Servers

### 1. **Context7** (`@upstash/context7-mcp`)
**Purpose**: Access up-to-date, version-specific documentation for any library

**Usage**: Just mention "use context7" in your chat when you need current library documentation

**Benefits**:
- Always up-to-date docs
- Version-specific information
- Works with thousands of libraries
- No manual searching required

### 2. **Playwright** (`@playwright/mcp`)
**Purpose**: Browser automation and web testing

**Capabilities**:
- Navigate websites
- Take screenshots
- Interact with web elements
- Generate test code
- Access accessibility trees

**Use Cases**:
- E2E testing
- Web scraping
- Browser automation
- Visual testing

### 3. **Supabase** (`@supabase/mcp-server-supabase`)
**Purpose**: Supabase database operations

**Capabilities**:
- Query databases
- Manage tables
- Execute SQL
- Handle authentication
- Work with storage

**Use Cases**:
- Database management
- Schema exploration
- Data queries
- Admin operations

## Servers Not Included (Not Yet Available)

The following servers were requested but don't have official MCP implementations yet:

- **chrome-devtools** - No official MCP server found
- **stripe** - No official MCP server found (as of Oct 2025)
- **vercel** - No official MCP server found

## Using MCP Servers

After installing this plugin:

1. **Automatic Activation**: MCP servers start automatically when you use the plugin
2. **Restart Required**: Restart Cursor after plugin installation
3. **Tool Access**: MCP tools appear in Cursor's available tools list

## Adding More MCP Servers

You can add custom MCP servers by modifying the plugin's `mcpServers` configuration in `.cursor-plugin/plugin.json`:

```json
{
  "mcpServers": {
    "your-server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

Alternatively, you can configure MCP servers in Cursor's settings or via your local MCP configuration file.

## Troubleshooting

**MCP servers not loading?**
1. Restart Cursor
2. Check that npm/npx is installed
3. Verify network connection (MCP servers download on first use)

**Performance issues?**
- MCP servers run on-demand
- First use may be slower (package download)
- Subsequent uses are fast

## Learn More

- Official MCP Documentation: https://modelcontextprotocol.io
- Cursor MCP Guide: https://docs.cursor.com
- MCP Server Directory: https://mcpcat.io
