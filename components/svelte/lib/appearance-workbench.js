/** @typedef {{id:string,label:string,imageUrl:string,canUseAsSheet?:boolean}} ArtworkReference */
/** @typedef {{identityLock:string,wardrobeLock:string,unknowns:readonly {detail:string,treatment:string}[]}} AppearanceBrief */
/** @typedef {{id:string,designId:string,name:string,review:{state:'unreviewed'|'reviewed'|'rejected',notes:string},pages:readonly {purpose:string,referenceId:string}[]}} DesignRevision */
/** @typedef {{canSourceHeadshot:boolean,revision:DesignRevision,images:readonly ArtworkReference[],selected:boolean}} DesignCandidate */
/** @typedef {{characterId:string,name:string,draft:{id:string}|null,preparation:{summary:string,evidence:readonly {detail:string,sceneNumbers:readonly number[]}[]},references:readonly ArtworkReference[],styleReferences:readonly ArtworkReference[],candidates:readonly DesignCandidate[],jobs:readonly {id:string,publication:string,requestId?:string,state?:string,revisionId?:string,error?:string}[],hasActiveJobs:boolean,generationReady:boolean,generationReason:string}} AppearanceWorkspace */
export {}
