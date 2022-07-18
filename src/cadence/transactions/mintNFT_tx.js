export const mintNFT = 
`
// REPLACE THIS WITH YOUR CONTRACT NAME + ADDRESS
import F1_NFTs from 0x3763d880823ca9cb; 
// This remains the same 
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

transaction(recipient: Address, name: String, description: String, thumbnail: String)
{
  prepare(signer: AuthAccount) {
    // Check if the user sending the transaction has a collection
    if signer.borrow<&F1_NFTs.Collection>(from: F1_NFTs.CollectionStoragePath) != nil {
        // If they do, we move on to the execute stage
        return
    }

    // If they don't, we create a new empty collection
    let collection <- F1_NFTs.createEmptyCollection()

    // Save it to the account
    signer.save(<-collection, to: F1_NFTs.CollectionStoragePath)

    // Create a public capability for the collection
    signer.link<&{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(
        F1_NFTs.CollectionPublicPath,
        target: F1_NFTs.CollectionStoragePath
    )
  }


  execute {
    // Borrow the recipient's public NFT collection reference
    let receiver = getAccount(recipient)
        .getCapability(F1_NFTs.CollectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not get receiver reference to the NFT Collection")

    // Mint the NFT and deposit it to the recipient's collection
    F1_NFTs.mintNFT(recipient: receiver, name: name, description: description, thumbnail: thumbnail)
    
    log("Minted an NFT and stored it into the collection")
  } 
}
`