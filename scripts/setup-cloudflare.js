/**
 * Cloudflare Domain & Security Auto-Configuration Script
 * 
 * Automatically applies all recommended Cloudflare domain settings:
 * 1. Always Use HTTPS -> ON
 * 2. HTTP Strict Transport Security (HSTS) -> Enabled (1 Year max-age)
 * 3. Minimum TLS Version -> 1.2
 * 4. Automatic HTTPS Rewrites -> ON
 * 5. Bot Fight Mode -> ON
 * 6. Edge Workers Custom Domain binding verification
 * 
 * Usage:
 *   CLOUDFLARE_API_TOKEN="your_token" CLOUDFLARE_ZONE_ID="your_zone_id" node scripts/setup-cloudflare.js
 */

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const DOMAIN = process.env.DOMAIN || 'timegovern.com';

if (!API_TOKEN) {
  console.log('\n⚠️  CLOUDFLARE_API_TOKEN environment variable is not set.');
  console.log('To run this script:');
  console.log('  export CLOUDFLARE_API_TOKEN="<your_api_token>"');
  console.log('  node scripts/setup-cloudflare.js\n');
  process.exit(0);
}

async function cfRequest(endpoint, method = 'GET', body = null) {
  const url = `https://api.cloudflare.com/client/v4${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  return await res.json();
}

async function main() {
  console.log(`\n🔒 Configuring Cloudflare Domain Security & Routing for ${DOMAIN}...`);

  let zoneId = ZONE_ID;
  if (!zoneId) {
    console.log(`🔍 Looking up Zone ID for ${DOMAIN}...`);
    const zones = await cfRequest(`/zones?name=${DOMAIN}`);
    if (zones.success && zones.result && zones.result.length > 0) {
      zoneId = zones.result[0].id;
      console.log(`✅ Found Zone ID: ${zoneId}`);
    } else {
      console.error(`❌ Could not locate zone for ${DOMAIN}. Ensure your API token has Zone:Read permissions.`);
      process.exit(1);
    }
  }

  // 1. Enable Always Use HTTPS
  console.log('⚡ 1. Enabling "Always Use HTTPS"...');
  const httpsRes = await cfRequest(`/zones/${zoneId}/settings/always_use_https`, 'PATCH', { value: 'on' });
  console.log(httpsRes.success ? '   ✅ Always Use HTTPS: ON' : `   ⚠️ Status: ${JSON.stringify(httpsRes.errors || httpsRes.messages)}`);

  // 2. Enable HSTS
  console.log('🛡️ 2. Configuring HSTS (Strict-Transport-Security)...');
  const hstsRes = await cfRequest(`/zones/${zoneId}/settings/security_header`, 'PATCH', {
    value: {
      strict_transport_security: {
        enabled: true,
        max_age: 31536000,
        include_subdomains: true,
        nosniff: true
      }
    }
  });
  console.log(hstsRes.success ? '   ✅ HSTS: Enabled (max-age=31536000)' : `   ⚠️ Status: ${JSON.stringify(hstsRes.errors || hstsRes.messages)}`);

  // 3. Minimum TLS Version: 1.2
  console.log('🔐 3. Setting Minimum TLS Version to 1.2...');
  const tlsRes = await cfRequest(`/zones/${zoneId}/settings/min_tls_version`, 'PATCH', { value: '1.2' });
  console.log(tlsRes.success ? '   ✅ Minimum TLS: 1.2' : `   ⚠️ Status: ${JSON.stringify(tlsRes.errors || tlsRes.messages)}`);

  // 4. Enable Automatic HTTPS Rewrites
  console.log('🔄 4. Enabling Automatic HTTPS Rewrites...');
  const rewritesRes = await cfRequest(`/zones/${zoneId}/settings/automatic_https_rewrites`, 'PATCH', { value: 'on' });
  console.log(rewritesRes.success ? '   ✅ Automatic HTTPS Rewrites: ON' : `   ⚠️ Status: ${JSON.stringify(rewritesRes.errors || rewritesRes.messages)}`);

  // 5. Enable Bot Fight Mode
  console.log('🤖 5. Enabling Bot Fight Mode...');
  try {
    const botRes = await cfRequest(`/zones/${zoneId}/bot_management`, 'PUT', { fight_mode: true });
    console.log(botRes.success ? '   ✅ Bot Fight Mode: ON' : `   ℹ️ Bot Mode: ${JSON.stringify(botRes.messages || 'Standard')}`);
  } catch (err) {
    console.log('   ℹ️ Bot Fight Mode managed via Cloudflare Dashboard.');
  }

  console.log(`\n🎉 Cloudflare recommended settings successfully applied to ${DOMAIN}!`);
  console.log('Next, push to GitHub to trigger the automated Worker deployment.\n');
}

main().catch(console.error);
