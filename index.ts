import { Markup, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import {
  Transaction,
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const bot = new Telegraf("8307987925:AAFrwvPAC9B-DdouKTePDdLwgHY8Tahicrw");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const users = new Map();
const sendSolState = new Map();

bot.command("quit", async (ctx) => {
  await ctx.leaveChat();
});
bot.start(async (ctx) => {
  users.set(ctx.chat.id.toString(), {});
  await ctx.reply(
    "Welcome to bonkit solana bot \nChoose an option below",
    Markup.inlineKeyboard([
      [Markup.button.callback("Generate Wallet", "generate_wallet")],
    ])
  );
});

bot.action("generate_wallet", async (ctx) => {
  const wallet = Keypair.generate();
  users.set(ctx.from.id, wallet);
  await ctx.reply(
    `Wallet generated, Here is your public key : ${wallet.publicKey}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("View Balance", "balance")],
      [
        Markup.button.callback("Send SOL", "send_sol"),
        Markup.button.callback("Request airdrop of 1 SOL", "airdrop_1SOL"),
      ],
    ])
  );
});

bot.action("airdrop_1SOL", async (ctx) => {
  const user = users.get(ctx.from.id);
  try {
    const sig = await connection.requestAirdrop(
      user.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(sig);
    const newBalance = await connection.getBalance(user.publicKey);
    await ctx.reply(
      `Successfully airdropped 1 SOl \n Updated balance : ${newBalance}`,
      Markup.inlineKeyboard([[Markup.button.callback("Send SOL", "send_sol")]])
    );
  } catch (e) {
    console.log("error during airdrop : ", e);
    await ctx.reply(
      "Too many requests : Rate limited:), Please try again after some time"
    );
  }
});

bot.action("balance", async (ctx) => {
  const user = users.get(ctx.from.id);
  const balance = await connection.getBalance(user.publicKey);
  console.log(balance);
  await ctx.reply(
    `Balance: ${balance / LAMPORTS_PER_SOL} SOL`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Send SOL", "send_sol"),
        Markup.button.callback("Request airdrop of 1 SOL", "airdrop_1SOL"),
      ],
    ])
  );
});

bot.action("send_sol", async (ctx) => {
  const userId = ctx.from.id;

  sendSolState.set(userId, "awaiting_address");

  await ctx.reply(
    "Pleae enter recipient wallet address and sol to send separated by comma ,"
  );
});

bot.on(message("text"), async (ctx) => {
  const userId = ctx.from.id;

  const state = sendSolState.get(userId);

  const userWallet = users.get(ctx.chat.id);

  console.log({ userWallet });

  if (state === "awaiting_address") {
    const fullMsg = ctx.message.text.trim();

    let recipientAddress = fullMsg.split(",")[0];
    let solAmount = fullMsg.split(",")[1];

    console.log({ recipientAddress, solAmount });

    let recipientPub;
    try {
      recipientPub = new PublicKey(recipientAddress as string);
    } catch (error) {
      await ctx.reply("please enter a valid public key for recipient address");
    }

    let tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userWallet.publicKey,
        toPubkey: recipientPub as PublicKey,
        lamports: Number(solAmount) * LAMPORTS_PER_SOL,
      })
    );

    const txSig = await sendAndConfirmTransaction(connection, tx, [userWallet]);
    console.log("SIGNATURE", txSig);

    ctx.reply(`tx done : ${txSig}`);
  }
});

bot.on(message("text"), async (ctx) => {
  await ctx.reply(`Welcome to bonkit solana bot`);
});

bot.launch();
