package com.smartstudyplanner.backend;

public class GenerateRequest {
    private String toolType;
    private String context;
    private Integer count;          // Quiz: number of questions
    private String questionType;    // Quiz: "multiple-choice" or "short-answer"

    public String getToolType() { return toolType; }
    public void setToolType(String toolType) { this.toolType = toolType; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }

    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
}
