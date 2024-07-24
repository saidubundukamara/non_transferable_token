import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

import {
    createInitializeMetadataPointerInstruction,
    createInitializeMintInstruction,
    createInitializeNonTransferableMintInstruction,
    ExtensionType,
    getMintLen,
    LENGTH_SIZE,
    TOKEN_2022_PROGRAM_ID,
    TYPE_SIZE,
} from '@solana/spl-token';


async function main() {

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.fromSecretKey(
        Uint8Array.from(
            [
                90, 219, 137,  11, 198,   4, 226, 159, 129,  84, 152,
          113, 200, 106, 163, 175,  64,  74,  69,  24, 199, 140,
           63, 151,  23,  35, 204, 135,  49,  56,  91, 174,  76,
           18,  30, 248,  70, 167,  52,  58, 197, 191, 146,  26,
           44, 151,  32, 124, 107, 153, 200,  36, 151, 136, 115,
          119,   4,  63, 142,  57, 224,  67,  95,  54
            ]
        )
    );

    const decimals = 9;

    const mintAuthority = Keypair.generate();
    console.log(mintAuthority.publicKey.toBase58());

    const mintKeypair = Keypair.generate();
    console.log(mintKeypair.publicKey.toBase58());

    const mint = mintKeypair.publicKey;
    const mintLen = getMintLen([ExtensionType.NonTransferable]);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey,null, TOKEN_2022_PROGRAM_ID),
    );

    await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair]);
    console.log('mint created');

}

main();