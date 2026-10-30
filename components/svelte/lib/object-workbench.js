/** @typedef {{form:string,materials:string,distinguishingDetails:readonly string[],state:string,authoredScale:string,unknowns:readonly {detail:string,treatment:string}[]}} ObjectBrief */
/** @typedef {{id:string,label:string,imageUrl:string,subjectName?:string,subject?:{kind:string},roles?:readonly string[]}} ObjectReference */
/** @typedef {{id:string,designId:string,name:string,createdAt:string,review:{state:'unreviewed'|'reviewed'|'rejected',notes:string},pages:readonly {purpose:string,referenceId:string}[]}} ObjectRevision */
/** @typedef {{label:string,revision:ObjectRevision,images:readonly ObjectReference[],selected:boolean}} ObjectCandidate */
/** @typedef {{id:string,requestId:string,state:string,publication:string,revisionId:string,error:string}} ObjectJob */
/** @typedef {{objectId:string,name:string,draft:{id:string}|null,preparation:{summary:string,atmosphere:string,evidence:readonly {detail:string,sceneNumbers:readonly number[]}[],changes:readonly {detail:string,sceneNumbers:readonly number[]}[]},references:readonly ObjectReference[],styleReferences:readonly ObjectReference[],projectReferences?:readonly ObjectReference[],candidates:readonly ObjectCandidate[],jobs:readonly ObjectJob[],generationReady:boolean,generationReason:string,hasActiveJobs:boolean}} ObjectWorkspace */
export {}
