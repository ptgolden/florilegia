# Florilegia

Desktop application for organizing reading notes.

## Data model

```turtle
:notebook1 {
:notebook1
    a flor:Notebook ;
    dce:created: "2017-03-02"@xsd:datetime ;
    dce:creator: "Patrick" ;
    pcdm:hasMember [
        :notebook1#annots,
        :notebook1#document
    ] .

:notebook1#annots
    a flor:AnnotationCollection ;
    pcdm:hasMember [
        :annot1,
        :annot2
    ] .

:notebook1#document
    a pcdm:Object ;
    pcdm:hasFile: <test_document.pdf> .


:annot1
    a oa:Annotation ;
    oa:hasBody :annot1#body ;
    oa:hasTarget :annot1#target .

:annot1#body
    a [ dctypes:Text, cnt:ContentAsText ] ;
    dce:format "text/plain"
    cnt:chars: "This is my comment" .

:annot1#target
    oa:hasSource <test_document.pdf> ;
    oa:hasSelector [
        :annot1#page-selector,
        :annot1#text-selector
    ] .

:annot1#page-selector
    a oa:FragmentSelector ;
    rdf:value "#page=3" .

:annot1#page-selector
    a oa:TextQuoteSelector ;
    oa:exact "...." .


:annot2
    ...
}
```
