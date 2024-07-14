import BIP32Factory from 'bip32'
import { mnemonicToSeed, generateMnemonic } from 'bip39'
import { SLIP77Factory } from 'slip77'
import * as liquid from 'liquidjs-lib'
import * as ecc from '@bitcoinerlab/secp256k1'

declare global {
  interface Window {
    QRCode?: any;
  }
}

const bip32 = BIP32Factory(ecc)
const slip77 = SLIP77Factory(ecc)

const PAPERWALLET_WIDTH = 1190
const PAPERWALLET_HEIGHT = 840
const chain = 0
const basePath = "m/84'/1776'/0'"
const network = liquid.networks.liquid

let QRCode = window.QRCode
let confidentialAddress: string = ''
const paperwalletDesign = new URL('./assets/paperwallet-design.svg', import.meta.url).href

const generate = async () => {
  destroyCanvas()
  var canvas = document.createElement('canvas');
  canvas.id = 'paperwallet-canvas'
  canvas.width = PAPERWALLET_WIDTH;
  canvas.height = PAPERWALLET_HEIGHT;
  document.getElementById('canvas-container')?.appendChild(canvas);

  var img = new Image();
  img.src = paperwalletDesign;

  img.onload = async () => {
    var ctx = (<HTMLCanvasElement>document.getElementById('paperwallet-canvas')).getContext("2d");
    if (ctx) {
      // draw paper wallet background over the canva element
      ctx.drawImage(img, 0, 0, PAPERWALLET_WIDTH, PAPERWALLET_HEIGHT);
      // generate a new mnemonic, blinding key and the first address of the derivation path
      const mnemonic = generateMnemonic()
      const seed = await mnemonicToSeed(mnemonic);
      const xpub = bip32.fromSeed(seed).derivePath(basePath).neutered().toBase58();
      let masterBlindingKey = slip77.fromSeed(seed)
      const pubkey = bip32.fromBase58(xpub, network).derive(chain).derive(0).publicKey
      const script = liquid.payments.p2wpkh({ network, pubkey }).output

      if (script) {
        let unconfidentialAddress = liquid.address.fromOutputScript(script, network)
        const blindingKey = masterBlindingKey.derive(script)
        if (blindingKey.publicKey) {
          const blindingPublicKey = blindingKey.publicKey;
          confidentialAddress = liquid.address.toConfidential(unconfidentialAddress, blindingPublicKey);
          // generate qrcodes with SVG
          const privateQrcode = new QRCode({
            msg: mnemonic,
            dim: 155,
            pad: 2,
            pal: ['#000', '#fff']
          });
          const publicQrcode = new QRCode({
            dim: 200,
            msg: confidentialAddress,
            pad: 2,
            pal: ['#000', '#fff']
          });
          // draw the paper wallet
          let canvas = <HTMLCanvasElement>document.getElementById("paperwallet-canvas");
          if (canvas) {
            let ctx = canvas.getContext("2d");
            const mnemonicAsArray = mnemonic.split(" ")
            // draw first part of mnemonic
            draw(mnemonicAsArray.slice(0, 6).join(" "), 16, -170, 304, -45)
            // draw second part of mnemonic
            draw(mnemonicAsArray.slice(6, 12).join(" "), 16, -170, 320, -45)
            // draw public address
            let splittedAddress = confidentialAddress.match(/.{1,40}/g) ?? []
            draw(splittedAddress.join("-"), 20, 700, 730)
            // draw qrcodes
            drawSVG(privateQrcode, ctx, 132, -75, 45);
            drawSVG(publicQrcode, ctx, 850, 500);
            // show download button
            document.getElementById('download')!.style.display = 'inline-block';
          }

        }
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // bind actions to generate and download buttons
  document.getElementById('generate')?.addEventListener('click', () => {
    generate()
  })
  document.getElementById('download')?.addEventListener('click', () => {
    download()
  })
})

/**
 * Force the browser to download the paper wallet
 */
function download() {
  var dataURL = (<HTMLCanvasElement>document.getElementById('paperwallet-canvas')).toDataURL('image/png');
  var link = document.createElement('a');
  link.download = `liquid-paperwallet-${confidentialAddress}`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  destroyCanvas()
  document.getElementById('download')?.remove();
}

/**
 * 
 * @param text text to write
 * @param fontSize size of the text
 * @param x X-axis point of the context
 * @param y Y-axis point of the context
 * @param angle angle of degree of the text
 */
function draw(text: string, fontSize: number = 15, x: number, y: number, angle: number = 0) {
  const ctx = (<HTMLCanvasElement>document.getElementById("paperwallet-canvas")).getContext("2d");
  if (ctx) {
    ctx.font = `${fontSize}px serif`;
    if (text.includes('-')) {
      text.split('-').map((word, i) => ctx.fillText(word, x, y + (i * 30)))
    } else {
      if (angle !== 0) {
        ctx.save();
        ctx.rotate(angle * Math.PI / 180);
        ctx.fillText(text, x, y);
        ctx.restore();
      } else {
        ctx.fillText(text, x, y);
      }
    }
  }
}

/**
 * Draw SVG on a canvas context
 * @param svgElement SVG to draw
 * @param ctx canvas context
 * @param x X-axis point of the context
 * @param y X-axis point of the context
 * @param angle angle of degree of the SVG
 */
function drawSVG(svgElement: any, ctx: any, x: number, y: number, angle: number = 0) {
  var svgURL = new XMLSerializer().serializeToString(svgElement);
  var img = new Image();

  img.onload = function () {
    ctx.save();
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(this, x, y);
    ctx.restore();
  }
  img.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgURL);
}

/**
 * remove paper wallet node from HTML
 */
function destroyCanvas() {
  document.getElementById('paperwallet-canvas')?.remove();
}